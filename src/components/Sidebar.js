/**
 * Sidebar Component - Block insertion and page controls
 */

import { getAllBlockTypes, createBlockInstance } from './BlockFactory.js';
import * as db from '../lib/db.js';
import * as state from '../lib/state.js';

export class Sidebar {
  constructor(container) {
    this.container = container;
    this.blockTypes = getAllBlockTypes();
    this.currentPageId = null;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="sidebar bg-white border-r border-gray-200 flex flex-col h-screen">
        <!-- Header -->
        <div class="sidebar-header p-4 border-b border-gray-200">
          <h2 class="font-bold text-lg">Add Blocks</h2>
        </div>

        <!-- Block Types -->
        <div class="sidebar-blocks flex-1 overflow-y-auto p-3 space-y-2">
          ${this.blockTypes.map(blockType => `
            <button 
              class="block-btn w-full text-left p-3 rounded border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition block-type-btn"
              data-block-type="${blockType.type}"
              title="${blockType.description}"
            >
              <div class="flex items-center gap-2">
                <span class="text-lg">${blockType.icon}</span>
                <div class="flex-1">
                  <div class="font-medium text-sm">${blockType.label}</div>
                  <div class="text-xs text-gray-500">${blockType.description}</div>
                </div>
              </div>
            </button>
          `).join('')}
        </div>

        <!-- Page Controls -->
        <div class="sidebar-footer border-t border-gray-200 p-4 space-y-2">
          <button id="save-page-btn" class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium">
            Save Changes
          </button>
          <button id="publish-btn" class="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-medium">
            Publish
          </button>
          <button id="preview-btn" class="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">
            Preview
          </button>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Block type buttons
    this.container.querySelectorAll('.block-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const blockType = btn.getAttribute('data-block-type');
        this.handleAddBlock(blockType);
      });
    });

    // Action buttons
    const saveBtn = this.container.querySelector('#save-page-btn');
    const publishBtn = this.container.querySelector('#publish-btn');
    const previewBtn = this.container.querySelector('#preview-btn');

    if (saveBtn) saveBtn.addEventListener('click', () => this.handleSavePage());
    if (publishBtn) publishBtn.addEventListener('click', () => this.handlePublish());
    if (previewBtn) previewBtn.addEventListener('click', () => this.handlePreview());
  }

  async handleAddBlock(blockType) {
    try {
      const currentState = state.getState();
      if (!currentState.currentPageId) {
        state.showToast('No page selected', 'error');
        return;
      }

      state.setLoading(true);

      // Create block instance
      const newBlock = createBlockInstance(blockType);

      // Save to database
      const savedBlock = await db.createBlock(currentState.currentPageId, {
        type: blockType,
        config: newBlock.config
      });

      // Update local state
      const blocks = state.getState().blocks || [];
      state.setBlocks([...blocks, savedBlock]);

      state.showToast(`${blockType} block added`, 'success');
    } catch (error) {
      console.error('Add block error:', error);
      state.showToast(`Error: ${error.message}`, 'error');
    } finally {
      state.setLoading(false);
    }
  }

  async handleSavePage() {
    try {
      const currentState = state.getState();
      if (!currentState.currentPageId) {
        state.showToast('No page selected', 'error');
        return;
      }

      state.setLoading(true);

      // Update page timestamp
      await db.updatePage(currentState.currentPageId, {
        updated_at: new Date().toISOString()
      });

      state.showToast('Changes saved', 'success');
    } catch (error) {
      console.error('Save error:', error);
      state.showToast(`Error: ${error.message}`, 'error');
    } finally {
      state.setLoading(false);
    }
  }

  async handlePublish() {
    try {
      const currentState = state.getState();
      if (!currentState.currentPageId) {
        state.showToast('No page selected', 'error');
        return;
      }

      const currentPage = currentState.currentPage;
      const isPublishing = !currentPage.published;

      state.setLoading(true);

      await db.togglePagePublished(currentState.currentPageId, isPublishing);

      // Update local state
      const updatedPage = { ...currentPage, published: isPublishing };
      state.setCurrentPage(updatedPage);

      state.showToast(
        isPublishing ? 'Page published' : 'Page unpublished',
        'success'
      );
    } catch (error) {
      console.error('Publish error:', error);
      state.showToast(`Error: ${error.message}`, 'error');
    } finally {
      state.setLoading(false);
    }
  }

  handlePreview() {
    const currentState = state.getState();
    if (!currentState.currentPageId) {
      state.showToast('No page selected', 'error');
      return;
    }

    const slug = currentState.currentPage?.slug;
    if (slug) {
      window.open(`/view.html?slug=${slug}`, '_blank');
    }
  }
}
