/**
 * PageManager Component - Page CRUD interface
 */

import * as db from '../lib/db.js';
import * as state from '../lib/state.js';
import { formatRelativeDate, slugify } from '../lib/utils.js';

export class PageManager {
  constructor(container) {
    this.container = container;
    this.pages = [];
    this.init();
  }

  async init() {
    await this.loadPages();
    this.render();
    this.subscribeToState();
  }

  async loadPages() {
    try {
      state.setLoading(true);
      this.pages = await db.getPages(true);
      state.setPages(this.pages);
    } catch (error) {
      console.error('Load pages error:', error);
      state.showToast(`Error loading pages: ${error.message}`, 'error');
    } finally {
      state.setLoading(false);
    }
  }

  subscribeToState() {
    this.unsubscribe = state.subscribe((newState) => {
      if (newState.pages && newState.pages.length !== this.pages.length) {
        this.pages = newState.pages;
        this.updatePagesList();
      }
    });
  }

  render() {
    this.container.innerHTML = `
      <div class="page-manager max-w-4xl mx-auto">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold">Pages</h1>
          <button id="new-page-btn" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            + New Page
          </button>
        </div>

        <div id="pages-list" class="space-y-3">
          ${this.getPagesList()}
        </div>
      </div>
    `;

    this.container.querySelector('#new-page-btn').addEventListener('click', () => {
      this.showCreatePageDialog();
    });

    this.updatePagesList();
  }

  getPagesList() {
    if (!this.pages || this.pages.length === 0) {
      return '<p class="text-gray-500 text-center py-8">No pages yet. Create one to get started.</p>';
    }

    return this.pages.map(page => `
      <div class="page-item p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="font-bold text-lg">
              <a href="#" class="page-title-link text-blue-600 hover:underline" data-page-id="${page.id}">
                ${page.title}
              </a>
            </h3>
            <p class="text-sm text-gray-600">${page.description || 'No description'}</p>
            <div class="flex gap-4 mt-2 text-xs text-gray-500">
              <span>slug: <code class="bg-gray-100 px-1 rounded">${page.slug}</code></span>
              <span>${formatRelativeDate(page.updated_at)}</span>
              <span class="px-2 py-1 rounded ${page.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                ${page.published ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
          <div class="flex gap-2">
            <button class="edit-page-btn px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition" data-page-id="${page.id}">
              Edit
            </button>
            <button class="delete-page-btn px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 transition" data-page-id="${page.id}">
              Delete
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  updatePagesList() {
    const listContainer = this.container.querySelector('#pages-list');
    if (listContainer) {
      listContainer.innerHTML = this.getPagesList();
      this.attachPageListeners();
    }
  }

  attachPageListeners() {
    // Title links - edit page
    this.container.querySelectorAll('.page-title-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = link.getAttribute('data-page-id');
        this.editPage(pageId);
      });
    });

    // Edit buttons
    this.container.querySelectorAll('.edit-page-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = btn.getAttribute('data-page-id');
        this.editPage(pageId);
      });
    });

    // Delete buttons
    this.container.querySelectorAll('.delete-page-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const pageId = btn.getAttribute('data-page-id');
        await this.deletePage(pageId);
      });
    });
  }

  async editPage(pageId) {
    try {
      const page = await db.getPage(pageId, true);
      if (!page) {
        state.showToast('Page not found', 'error');
        return;
      }

      // Load page and blocks
      state.setCurrentPage(page);
      const blocks = await db.getBlocks(pageId);
      state.setBlocks(blocks);

      // Navigate to editor
      window.location.href = `/admin.html?page=${pageId}`;
    } catch (error) {
      console.error('Edit page error:', error);
      state.showToast(`Error: ${error.message}`, 'error');
    }
  }

  async deletePage(pageId) {
    const page = this.pages.find(p => p.id === pageId);
    if (!page || !confirm(`Delete page "${page.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      state.setLoading(true);
      await db.deletePage(pageId);

      // Update local state
      const updatedPages = this.pages.filter(p => p.id !== pageId);
      state.setPages(updatedPages);

      state.showToast('Page deleted', 'success');
    } catch (error) {
      console.error('Delete page error:', error);
      state.showToast(`Error: ${error.message}`, 'error');
    } finally {
      state.setLoading(false);
    }
  }

  showCreatePageDialog() {
    state.showModal({
      title: 'Create New Page',
      content: `
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Page Title</label>
            <input 
              type="text" 
              id="page-title-input" 
              class="w-full p-2 border border-gray-300 rounded"
              placeholder="e.g., About Us, Blog"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">URL Slug (auto-generated)</label>
            <input 
              type="text" 
              id="page-slug-input" 
              class="w-full p-2 border border-gray-300 rounded bg-gray-50"
              placeholder="e.g., about-us"
              readonly
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Description (optional)</label>
            <textarea 
              id="page-desc-input" 
              class="w-full p-2 border border-gray-300 rounded resize-none h-20"
              placeholder="Brief description of the page"
            ></textarea>
          </div>
        </div>
      `,
      actions: [
        {
          label: 'Create',
          variant: 'primary',
          onClick: async (modal) => {
            const title = document.getElementById('page-title-input')?.value || '';
            const slug = document.getElementById('page-slug-input')?.value || '';
            const description = document.getElementById('page-desc-input')?.value || '';

            if (!title.trim()) {
              state.showToast('Please enter a page title', 'error');
              return;
            }

            await this.createPage({ title, slug, description });
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

    // Auto-generate slug
    setTimeout(() => {
      const titleInput = document.getElementById('page-title-input');
      const slugInput = document.getElementById('page-slug-input');

      if (titleInput && slugInput) {
        titleInput.addEventListener('input', () => {
          slugInput.value = slugify(titleInput.value);
        });
      }
    }, 0);
  }

  async createPage(pageData) {
    try {
      state.setLoading(true);

      const newPage = await db.createPage(pageData);

      // Update local state
      const updatedPages = [newPage, ...this.pages];
      state.setPages(updatedPages);

      state.showToast('Page created successfully', 'success');

      // Navigate to editor
      setTimeout(() => {
        window.location.href = `/admin.html?page=${newPage.id}`;
      }, 500);
    } catch (error) {
      console.error('Create page error:', error);
      state.showToast(`Error: ${error.message}`, 'error');
    } finally {
      state.setLoading(false);
    }
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
  }
}
