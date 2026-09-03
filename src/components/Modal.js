/**
 * Modal Component - Reusable dialog/modal system
 */

import * as state from '../lib/state.js';

export class Modal {
  constructor(container) {
    this.container = container;
    this.currentModal = null;
    this.subscribeToState();
  }

  subscribeToState() {
    state.subscribe((newState) => {
      if (newState.modal !== this.currentModal) {
        this.currentModal = newState.modal;
        if (newState.modal) {
          this.show(newState.modal);
        } else {
          this.hide();
        }
      }
    });
  }

  show(modalConfig) {
    const { title, content, actions = [] } = modalConfig;

    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        state.closeModal();
      }
    });

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal bg-white rounded-lg shadow-lg max-w-md w-full mx-4';

    // Header
    if (title) {
      const header = document.createElement('div');
      header.className = 'modal-header px-6 py-4 border-b border-gray-200';
      header.innerHTML = `<h2 class="text-xl font-bold">${title}</h2>`;
      modal.appendChild(header);
    }

    // Content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'modal-content px-6 py-4';
    if (typeof content === 'string') {
      contentDiv.innerHTML = content;
    } else {
      contentDiv.appendChild(content);
    }
    modal.appendChild(contentDiv);

    // Footer (Actions)
    if (actions.length > 0) {
      const footer = document.createElement('div');
      footer.className = 'modal-footer px-6 py-4 border-t border-gray-200 flex gap-3 justify-end';

      actions.forEach(action => {
        const button = document.createElement('button');
        button.textContent = action.label;
        button.className = this.getButtonClass(action.variant);
        button.addEventListener('click', () => {
          if (action.onClick) {
            action.onClick(modalConfig);
          }
        });
        footer.appendChild(button);
      });

      modal.appendChild(footer);
    }

    backdrop.appendChild(modal);
    this.container.appendChild(backdrop);

    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        state.closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Clean up on backdrop removal
    const observer = new MutationObserver(() => {
      if (!document.contains(backdrop)) {
        document.removeEventListener('keydown', handleEscape);
        observer.disconnect();
      }
    });
    observer.observe(this.container, { childList: true });
  }

  hide() {
    const backdrop = this.container.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  }

  getButtonClass(variant = 'primary') {
    const base = 'px-4 py-2 rounded font-medium transition';
    const variants = {
      primary: `${base} bg-blue-600 text-white hover:bg-blue-700`,
      secondary: `${base} bg-gray-200 text-gray-800 hover:bg-gray-300`,
      danger: `${base} bg-red-600 text-white hover:bg-red-700`
    };
    return variants[variant] || variants.primary;
  }
}
