/**
 * Canvas Component - Main drag-and-drop editor interface
 * Handles block reordering and editing
 */

import Sortable from 'sortablejs';
import { createBlockEditor, renderBlock } from './BlockFactory.js';
import * as db from '../lib/db.js';
import * as state from '../lib/state.js';

export class Canvas {
  constructor(container, pageId) {
    this.container = container;
    this.pageId = pageId;
    this.blocks = [];
    this.sortable = null;
    this.blockEditors = new Map();
    this.init();
  }

  async init() {
    this.render();
    this.setupSortable();
    this.subscribeToState();
  }

  subscribeToState() {
    this.unsubscribe = state.subscribe((newState) => {
      if (newState.blocks !== this.blocks) {
        this.blocks = newState.blocks;
        this.updateBlocksView();
      }
    });
  }

  render() {
    this.container.innerHTML = `
      <div class="canvas">
        <div class="canvas-content" id="blocks-container">
          <div class="empty-state">
            <p class="text-center text-gray-500 py-12">
              No blocks yet. Add one from the sidebar to get started.
            </p>
          </div>
        </div>
      </div>
    `;

    this.blocksContainer = this.container.querySelector('#blocks-container');
    this.updateBlocksView();
  }

  setupSortable() {
    this.sortable = new Sortable(this.blocksContainer, {
      handle: '.drag-handle',
      animation: 150,
      ghostClass: 'sortable-ghost',
      dragClass: 'sortable-drag',
      onEnd: () => this.handleReorder()
    });
  }

  async updateBlocksView() {
    if (!this.blocks || this.blocks.length === 0) {
      this.blocksContainer.innerHTML = `
        <div class="empty-state">
          <p class="text-center text-gray-500 py-12">
            No blocks yet. Add one from the sidebar to get started.
          </p>
        </div>
      `;
      return;
    }

    this.blocksContainer.innerHTML = '';
    this.blockEditors.clear();

    this.blocks.forEach((block, index) => {
      const wrapper = this.createBlockWrapper(block, index);
      this.blocksContainer.appendChild(wrapper);
    });
  }

  createBlockWrapper(block, index) {
    const wrapper = document.createElement('div');
    wrapper.className = 'block-wrapper group relative mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-blue-300 transition';
    wrapper.setAttribute('data-block-id', block.id);
    wrapper.setAttribute('data-index', index);

    const dragHandle = document.createElement('div');
    dragHandle.className = 'drag-handle absolute left-0 top-0 bottom-0 w-1 bg-blue-500 cursor-grab active:cursor-grabbing group-hover:block hidden';

    const editorContainer = document.createElement('div');

    const blockEditor = createBlockEditor(
      block,
      (updatedBlock) => this.handleBlockUpdate(updatedBlock),
      (blockId) => this.handleBlockDelete(blockId)
    );

    editorContainer.appendChild(blockEditor);
    wrapper.appendChild(dragHandle);
    wrapper.appendChild(editorContainer);

    return wrapper;
  }

  async handleBlockUpdate(updatedBlock) {
    try {
      await db.updateBlock(updatedBlock.id, updatedBlock.config);

      // Update local state
      const updatedBlocks = this.blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b);
      state.setBlocks(updatedBlocks);

      state.showToast('Block updated', 'success');
    } catch (error) {
      console.error('Update error:', error);
      state.showToast(`Error: ${error.message}`, 'error');
    }
  }

  async handleBlockDelete(blockId) {
    if (!confirm('Delete this block? This action cannot be undone.')) {
      return;
    }

    try {
      await db.deleteBlock(blockId);

      // Update local state
      const updatedBlocks = this.blocks.filter(b => b.id !== blockId);
      state.setBlocks(updatedBlocks);

      state.showToast('Block deleted', 'success');
    } catch (error) {
      console.error('Delete error:', error);
      state.showToast(`Error: ${error.message}`, 'error');
    }
  }

  async handleReorder() {
    try {
      const newOrder = Array.from(this.blocksContainer.children)
        .map((el, idx) => {
          const blockId = el.getAttribute('data-block-id');
          return this.blocks.find(b => b.id === blockId);
        })
        .filter(Boolean);

      // Update local state first
      state.setBlocks(newOrder);

      // Persist to database
      await db.reorderBlocks(newOrder);

      state.showToast('Block order updated', 'success');
    } catch (error) {
      console.error('Reorder error:', error);
      state.showToast(`Error: ${error.message}`, 'error');
      this.updateBlocksView(); // Revert UI
    }
  }

  addBlock(blockData) {
    const newBlocks = [...this.blocks, blockData];
    state.setBlocks(newBlocks);
  }

  removeBlock(blockId) {
    const newBlocks = this.blocks.filter(b => b.id !== blockId);
    state.setBlocks(newBlocks);
  }

  destroy() {
    if (this.sortable) this.sortable.destroy();
    if (this.unsubscribe) this.unsubscribe();
  }
}
