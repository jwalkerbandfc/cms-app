/**
 * Toast Component - Toast notification system
 */

import * as state from '../lib/state.js';

export class Toast {
  constructor(container) {
    this.container = container;
    this.subscribeToState();
  }

  subscribeToState() {
    state.subscribe((newState) => {
      if (newState.toast) {
        this.show(newState.toast);
      }
    });
  }

  show(toast) {
    const { message, type = 'info' } = toast;

    const toastEl = document.createElement('div');
    toastEl.className = `toast toast-${type} fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300 z-40`;

    const bgColor = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    }[type] || 'bg-blue-500';

    toastEl.className += ` ${bgColor}`;

    // Content
    const content = document.createElement('div');
    content.className = 'flex items-center gap-3';

    // Icon
    const icon = document.createElement('span');
    icon.className = 'flex-shrink-0';
    icon.innerHTML = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    }[type] || 'ℹ';

    // Message
    const messageEl = document.createElement('span');
    messageEl.textContent = message;

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'flex-shrink-0 ml-auto text-white/80 hover:text-white';
    closeBtn.innerHTML = '×';
    closeBtn.addEventListener('click', () => toastEl.remove());

    content.appendChild(icon);
    content.appendChild(messageEl);
    content.appendChild(closeBtn);

    toastEl.appendChild(content);
    this.container.appendChild(toastEl);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (toastEl.parentNode) {
        toastEl.remove();
      }
    }, 3000);
  }
}
