/**
 * Editor Component - Main editor page layout
 * Orchestrates sidebar, canvas, and controls
 */

import { Canvas } from './Canvas.js';
import { Sidebar } from './Sidebar.js';
import * as db from '../lib/db.js';
import * as state from '../lib/state.js';
import { getQueryParam } from '../lib/utils.js';

export class Editor {
  constructor(container) {
    this.container = container;
    this.canvas = null;
    this.sidebar = null;
    this.pageId = null;
    this.page = null;
    this.blocks = [];
  }

  async init() {
    // Get page ID from query param
    this.pageId = getQueryParam('page');

    if (!this.pageId) {
      this.showPageSelector();
      return;
    }

    try {
      state.setLoading(true);

      // Load page
      this.page = await db.getPage(this.pageId, true);
      if (!this.page) {
        state.showToast('Page not found', 'error');
        window.location.href = '/admin.html';
        return;
      }

      // Load blocks
      this.blocks = await db.getBlocks(this.pageId);

      // Update state
      state.setCurrentPage(this.page);
      state.setBlocks(this.blocks);

      // Update page title
      const pageTitle = document.getElementById('page-title');
      if (pageTitle) {
        pageTitle.textContent = this.page.title;
      }

      // Render editor
      this.render();
    } catch (error) {
      console.error('Load page error:', error);
      state.showToast(`Error: ${error.message}`, 'error');
    } finally {
      state.setLoading(false);
    }
  }

  /**
   * Render editor layout
   */
  render() {
    const editorContainer = document.querySelector('.editor-container');
    if (!editorContainer) {
      console.error('Editor container not found');
      return;
    }

    // Sidebar
    const sidebarContainer = editorContainer.querySelector('#sidebar-container');
    if (sidebarContainer && !this.sidebar) {
      this.sidebar = new Sidebar(sidebarContainer);
    }

    // Canvas
    const canvasContainer = editorContainer.querySelector('#canvas-container');
    if (canvasContainer && !this.canvas) {
      this.canvas = new Canvas(canvasContainer, this.pageId);
    }

    // Setup page controls
    this.setupPageControls();
  }

  /**
   * Setup page-level controls
   */
  setupPageControls() {
    // Page metadata button
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
      pageTitle.addEventListener('click', () => {
        this.showPageMetadataDialog();
      });
      pageTitle.style.cursor = 'pointer';
    }
  }

  /**
   * Show page metadata editor
   */
  showPageMetadataDialog() {
    state.showModal({
      title: 'Page Settings',
      content: `
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Title</label>
            <input 
              type="text" 
              id="page-title-input" 
              class="w-full p-2 border border-gray-300 rounded"
              value="${this.page.title}"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Slug</label>
            <input 
              type="text" 
              id="page-slug-input" 
              class="w-full p-2 border border-gray-300 rounded bg-gray-50"
              value="${this.page.slug}"
              readonly
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Description</label>
            <textarea 
              id="page-desc-input" 
              class="w-full p-2 border border-gray-300 rounded resize-none h-20"
            >${this.page.description || ''}</textarea>
          </div>
          <div class="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="page-published-input" 
              ${this.page.published ? 'checked' : ''}
            />
            <label for="page-published-input" class="text-sm">Published (visible to public)</label>
          </div>
        </div>
      `,
      actions: [
        {
          label: 'Save',
          variant: 'primary',
          onClick: async () => {
            await this.savePageMetadata();
            state.closeModal();
          }
        },
        {
          label: 'Cancel',
          variant: 'secondary',
          onClick: () => state.closeModal()
        }
      ]
    });
  }

  /**
   * Save page metadata
   */
  async savePageMetadata() {
    try {
      state.setLoading(true);

      const title = document.getElementById('page-title-input')?.value || '';
      const description = document.getElementById('page-desc-input')?.value || '';
      const published = document.getElementById('page-published-input')?.checked || false;

      if (!title.trim()) {
        state.showToast('Please enter a page title', 'error');
        return;
      }

      // Update page
      const updated = await db.updatePage(this.pageId, {
        title,
        description,
        published,
        published_at: published ? new Date().toISOString() : null
      });

      // Update state
      this.page = updated;
      state.setCurrentPage(updated);

      // Update UI
      const pageTitle = document.getElementById('page-title');
      if (pageTitle) {
        pageTitle.textContent = title;
      }

      state.showToast('Page settings saved', 'success');
    } catch (error) {
      console.error('Save error:', error);
      state.showToast(`Error: ${error.message}`, 'error');
    } finally {
      state.setLoading(false);
    }
  }

  /**
   * Show page selector (no page ID in URL)
   */
  showPageSelector() {
    const canvasContainer = document.querySelector('#canvas-container');
    if (!canvasContainer) return;

    canvasContainer.innerHTML = `
      <div class="p-8">
        <h1 class="text-3xl font-bold mb-4">CMS Editor</h1>
        <p class="text-gray-600 mb-6">Select a page to edit or create a new one.</p>
        
        <div id="page-selector" class="space-y-3"></div>
        
        <button id="create-page-btn" class="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          Create New Page
        </button>
      </div>
    `;

    this.loadPagesList();

    document.getElementById('create-page-btn')?.addEventListener('click', async () => {
      await this.showCreatePageDialog();
    });
  }

  /**
   * Load and display pages list
   */
  async loadPagesList() {
    try {
      const pages = await db.getPages(true);
      const selector = document.getElementById('page-selector');
      if (!selector) return;

      if (pages.length === 0) {
        selector.innerHTML = '<p class="text-gray-500">No pages yet. Create one to get started.</p>';
        return;
      }

      selector.innerHTML = pages.map(page => `
        <div class="p-4 bg-white border border-gray-200 rounded cursor-pointer hover:shadow-md transition">
          <a href="?page=${page.id}" class="block">
            <h3 class="font-bold text-lg text-blue-600 hover:underline">${page.title}</h3>
            <p class="text-sm text-gray-600">${page.description || 'No description'}</p>
            <div class="flex gap-3 mt-2 text-xs text-gray-500">
              <span>${page.slug}</span>
              <span>${page.published ? '✓ Published' : '◯ Draft'}</span>
            </div>
          </a>
        </div>
      `).join('');
    } catch (error) {
      console.error('Load pages error:', error);
      state.showToast(`Error loading pages: ${error.message}`, 'error');
    }
  }

  /**
   * Show create page dialog
   */
  async showCreatePageDialog() {
    state.showModal({
      title: 'Create New Page',
      content: `
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Page Title</label>
            <input 
              type="text" 
              id="new-page-title" 
              class="w-full p-2 border border-gray-300 rounded"
              placeholder="e.g., About Us, Blog"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Description</label>
            <textarea 
              id="new-page-desc" 
              class="w-full p-2 border border-gray-300 rounded resize-none h-20"
              placeholder="Brief description..."
            ></textarea>
          </div>
        </div>
      `,
      actions: [
        {
          label: 'Create',
          variant: 'primary',
          onClick: async () => {
            const title = document.getElementById('new-page-title')?.value || '';
            const description = document.getElementById('new-page-desc')?.value || '';

            if (!title.trim()) {
              state.showToast('Please enter a title', 'error');
              return;
            }

            try {
              state.setLoading(true);

              const newPage = await db.createPage({
                title,
                description,
                slug: title.toLowerCase().replace(/\s+/g, '-')
              });

              state.closeModal();
              state.showToast('Page created', 'success');

              // Redirect to new page
              setTimeout(() => {
                window.location.href = `?page=${newPage.id}`;
              }, 500);
            } catch (error) {
              state.showToast(`Error: ${error.message}`, 'error');
            } finally {
              state.setLoading(false);
            }
          }
        },
        {
          label: 'Cancel',
          variant: 'secondary',
          onClick: () => state.closeModal()
        }
      ]
    });
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.canvas) this.canvas.destroy();
  }
}
