import { supabase } from './supabaseClient.js';

/**
 * PAGE OPERATIONS
 */

/**
 * Fetch all pages (admin can see all, public sees only published)
 */
export async function getPages(isAdmin = false) {
  let query = supabase
    .from('pages')
    .select('id, title, slug, description, published, created_at, updated_at');

  if (!isAdmin) {
    query = query.eq('published', true);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(`Failed to fetch pages: ${error.message}`);
  return data;
}

/**
 * Fetch single page by slug or ID
 */
export async function getPage(slugOrId, isAdmin = false) {
  let query = supabase
    .from('pages')
    .select('*');

  if (isAdmin) {
    // Admin can see by ID or slug
    query = query.or(`id.eq.${slugOrId},slug.eq.${slugOrId}`);
  } else {
    // Public can only see published pages by slug
    query = query
      .eq('slug', slugOrId)
      .eq('published', true);
  }

  const { data, error } = await query.single();
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch page: ${error.message}`);
  }
  return data || null;
}

/**
 * Create new page
 */
export async function createPage(pageData) {
  const { title, slug, description } = pageData;

  // Validate slug uniqueness
  const existing = await supabase
    .from('pages')
    .select('id')
    .eq('slug', slug)
    .single();

  if (existing.data) {
    throw new Error('Page slug already exists');
  }

  const { data, error } = await supabase
    .from('pages')
    .insert({
      title,
      slug: slug.toLowerCase().replace(/\s+/g, '-'),
      description: description || '',
      published: false,
      meta: { author: null, seo_title: '', seo_description: '' }
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create page: ${error.message}`);
  return data;
}

/**
 * Update page metadata
 */
export async function updatePage(pageId, updates) {
  const { data, error } = await supabase
    .from('pages')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', pageId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update page: ${error.message}`);
  return data;
}

/**
 * Publish/unpublish page
 */
export async function togglePagePublished(pageId, published) {
  return updatePage(pageId, {
    published,
    published_at: published ? new Date().toISOString() : null
  });
}

/**
 * Delete page and cascade blocks
 */
export async function deletePage(pageId) {
  // Delete blocks first (cascade handled by DB, but explicit for clarity)
  await supabase
    .from('blocks')
    .delete()
    .eq('page_id', pageId);

  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', pageId);

  if (error) throw new Error(`Failed to delete page: ${error.message}`);
}

/**
 * BLOCK OPERATIONS
 */

/**
 * Fetch all blocks for a page
 */
export async function getBlocks(pageId) {
  const { data, error } = await supabase
    .from('blocks')
    .select('*')
    .eq('page_id', pageId)
    .order('order', { ascending: true });

  if (error) throw new Error(`Failed to fetch blocks: ${error.message}`);
  return data || [];
}

/**
 * Create new block
 */
export async function createBlock(pageId, blockData) {
  const { type, config = {} } = blockData;

  // Get max order for this page
  const { data: lastBlock } = await supabase
    .from('blocks')
    .select('order')
    .eq('page_id', pageId)
    .order('order', { ascending: false })
    .limit(1)
    .single();

  const order = (lastBlock?.order || -1) + 1;

  const { data, error } = await supabase
    .from('blocks')
    .insert({
      page_id: pageId,
      type,
      config,
      order,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create block: ${error.message}`);
  return data;
}

/**
 * Update block configuration
 */
export async function updateBlock(blockId, config) {
  const { data, error } = await supabase
    .from('blocks')
    .update({
      config,
      updated_at: new Date().toISOString()
    })
    .eq('id', blockId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update block: ${error.message}`);
  return data;
}

/**
 * Reorder blocks
 */
export async function reorderBlocks(blockUpdates) {
  const { error } = await supabase
    .from('blocks')
    .upsert(
      blockUpdates.map((update, idx) => ({
        id: update.id,
        order: idx,
        updated_at: new Date().toISOString()
      }))
    );

  if (error) throw new Error(`Failed to reorder blocks: ${error.message}`);
}

/**
 * Delete block
 */
export async function deleteBlock(blockId) {
  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('id', blockId);

  if (error) throw new Error(`Failed to delete block: ${error.message}`);
}

/**
 * Duplicate block
 */
export async function duplicateBlock(blockId) {
  const { data: sourceBlock, error: fetchError } = await supabase
    .from('blocks')
    .select('*')
    .eq('id', blockId)
    .single();

  if (fetchError) throw new Error(`Failed to fetch block: ${fetchError.message}`);

  const { data: maxOrder } = await supabase
    .from('blocks')
    .select('order')
    .eq('page_id', sourceBlock.page_id)
    .order('order', { ascending: false })
    .limit(1)
    .single();

  const { data, error } = await supabase
    .from('blocks')
    .insert({
      ...sourceBlock,
      id: undefined,
      order: (maxOrder?.order || -1) + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to duplicate block: ${error.message}`);
  return data;
}
