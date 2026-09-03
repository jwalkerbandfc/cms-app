-- ============================================================================
-- CMS DATABASE SCHEMA
-- Supabase PostgreSQL Schema with Row Level Security (RLS)
-- ============================================================================

-- ============================================================================
-- TABLES
-- ============================================================================

-- Pages Table
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$')
);

-- Blocks Table (Page sections/components)
CREATE TABLE IF NOT EXISTS public.blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT block_type_check CHECK (
    type IN ('text', 'heading', 'image', 'video', 'gallery', 'spacer', 'divider')
  )
);

-- Media Table (Track uploaded files)
CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER,
  width INTEGER,
  height INTEGER,
  bucket TEXT DEFAULT 'cms-media',
  path TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Audit Log Table (Track changes)
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_pages_slug ON public.pages(slug);
CREATE INDEX idx_pages_published ON public.pages(published);
CREATE INDEX idx_pages_created_by ON public.pages(created_by);
CREATE INDEX idx_blocks_page_id ON public.blocks(page_id);
CREATE INDEX idx_blocks_order ON public.blocks(page_id, "order");
CREATE INDEX idx_media_uploaded_by ON public.media(uploaded_by);
CREATE INDEX idx_media_bucket ON public.media(bucket);
CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- PAGES RLS POLICIES
-- Published pages are readable by anyone
CREATE POLICY "Published pages are readable by anyone" ON public.pages
  FOR SELECT
  USING (published = TRUE);

-- Authenticated users can see all pages (for editing)
CREATE POLICY "Authenticated users can see all pages" ON public.pages
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users can create pages
CREATE POLICY "Authenticated users can create pages" ON public.pages
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    created_by = auth.uid()
  );

-- Users can update their own pages
CREATE POLICY "Users can update their own pages" ON public.pages
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    created_by = auth.uid()
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    created_by = auth.uid()
  );

-- Users can delete their own pages
CREATE POLICY "Users can delete their own pages" ON public.pages
  FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    created_by = auth.uid()
  );

-- BLOCKS RLS POLICIES
-- Published page blocks are readable by anyone
CREATE POLICY "Blocks of published pages readable by anyone" ON public.blocks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = blocks.page_id
      AND pages.published = TRUE
    )
  );

-- Authenticated users can see all blocks (for editing)
CREATE POLICY "Authenticated users can see all blocks" ON public.blocks
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can manage blocks on their pages
CREATE POLICY "Users can create blocks on their pages" ON public.blocks
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = blocks.page_id
      AND pages.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update blocks on their pages" ON public.blocks
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = blocks.page_id
      AND pages.created_by = auth.uid()
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = blocks.page_id
      AND pages.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete blocks on their pages" ON public.blocks
  FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = blocks.page_id
      AND pages.created_by = auth.uid()
    )
  );

-- MEDIA RLS POLICIES
-- Authenticated users can view all media
CREATE POLICY "Authenticated users can view media" ON public.media
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users can upload media
CREATE POLICY "Authenticated users can upload media" ON public.media
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    uploaded_by = auth.uid()
  );

-- Users can delete their own media
CREATE POLICY "Users can delete their own media" ON public.media
  FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    uploaded_by = auth.uid()
  );

-- AUDIT LOG RLS POLICIES
-- Only authenticated users can read audit logs
CREATE POLICY "Authenticated users can read audit logs" ON public.audit_log
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to log changes to audit log
CREATE OR REPLACE FUNCTION audit_log_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_log (
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    user_id
  ) VALUES (
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    to_jsonb(OLD),
    to_jsonb(NEW),
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamps on pages
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Update timestamps on blocks
CREATE TRIGGER update_blocks_updated_at
  BEFORE UPDATE ON public.blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Audit log for pages
CREATE TRIGGER audit_pages
  AFTER INSERT OR UPDATE OR DELETE ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION audit_log_trigger();

-- Audit log for blocks
CREATE TRIGGER audit_blocks
  AFTER INSERT OR UPDATE OR DELETE ON public.blocks
  FOR EACH ROW
  EXECUTE FUNCTION audit_log_trigger();

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Create storage buckets (run these in Supabase dashboard if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('cms-media', 'cms-media', true);

-- Storage bucket policies would be configured in Supabase dashboard:
-- - Allow authenticated users to upload to cms-media bucket
-- - Allow public read access to cms-media bucket (for public pages)

-- ============================================================================
-- INITIAL DATA (Optional)
-- ============================================================================

-- Create a demo user and page (uncomment to use)
-- INSERT INTO public.pages (title, slug, description, published, created_by)
-- VALUES ('Welcome', 'welcome', 'Welcome to the CMS', true, auth.uid());
