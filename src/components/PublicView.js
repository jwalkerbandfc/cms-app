/**
 * PublicView Component - Renders published pages
 */

import { renderBlock } from './BlockFactory.js';
import * as db from '../lib/db.js';
import * as state from '../lib/state.js';
import { getQueryParam } from '../lib/utils.js';

export class PublicView {
  constructor(container) {
    this.container = container;
    this.currentPage = null;
    this.blocks = [];
  }

  async init() {
    try {
      state.setLoading(true);

      // Get page slug from query parameter
      const slug = getQueryParam('slug');
      if (!slug) {
        this.showError('No page specified');
        return;
      }

      // Fetch page
      this.currentPage = await db.getPage(slug, false);
      if (!this.currentPage) {
        this.showError('Page not found');
        return;
      }

      // Fetch blocks
      this.blocks = await db.getBlocks(this.currentPage.id);

      this.render();
    } catch (error) {
      console.error('Load page error:', error);
      this.showError(`Error loading page: ${error.message}`);
    } finally {
      state.setLoading(false);
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="page-viewer">
        <header class="page-header py-8 px-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div class="max-w-4xl mx-auto">
            <h1 class="text-4xl font-bold mb-2">${this.currentPage.title}</h1>
            ${this.currentPage.description ? `<p class="text-lg opacity-90">${this.currentPage.description}</p>` : ''}
          </div>
        </header>

        <main class="page-content max-w-4xl mx-auto px-4 py-8">
          <div id="blocks-container"></div>
        </main>

        <footer class="page-footer mt-12 py-8 px-4 bg-gray-100 text-center text-sm text-gray-600">
          <p>&copy; 2024. All rights reserved.</p>
        </footer>
      </div>
    `;

    this.renderBlocks();
  }

  renderBlocks() {
    const container = this.container.querySelector('#blocks-container');

    if (!this.blocks || this.blocks.length === 0) {
      container.innerHTML = '<p class="text-center text-gray-500 py-12">No content available.</p>';
      return;
    }

    this.blocks.forEach(block => {
      try {
        const blockElement = renderBlock(block, 'public');
        if (blockElement) {
          container.appendChild(blockElement);
        }
      } catch (error) {
        console.error(`Error rendering block ${block.id}:`, error);
      }
    });
  }

  showError(message) {
    this.container.innerHTML = `
      <div class="flex items-center justify-center min-h-screen bg-gray-50">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">Error</h1>
          <p class="text-xl text-gray-600 mb-8">${message}</p>
          <a href="/" class="text-blue-600 hover:underline">← Back to home</a>
        </div>
      </div>
    `;
  }
}
