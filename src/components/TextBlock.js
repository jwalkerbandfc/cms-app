/**
 * TextBlock Component - Rich text content block
 * Handles paragraph text editing with formatting
 */

export class TextBlock {
  constructor(config = {}, onUpdate, onDelete) {
    this.config = {
      content: '<p>Click to edit text...</p>',
      ...config
    };
    this.onUpdate = onUpdate;
    this.onDelete = onDelete;
    this.container = null;
  }

  /**
   * Render block in view mode
   */
  render() {
    const div = document.createElement('div');
    div.className = 'prose max-w-none';
    div.innerHTML = this.config.content;
    return div;
  }

  /**
   * Render block in edit mode
   */
  edit() {
    const container = document.createElement('div');
    container.className = 'text-block-editor space-y-3';

    // Editor toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'flex gap-2 mb-3 p-2 bg-gray-100 rounded';
    toolbar.innerHTML = `
      <button title="Bold" class="px-2 py-1 hover:bg-gray-200 rounded" data-format="bold">
        <strong>B</strong>
      </button>
      <button title="Italic" class="px-2 py-1 hover:bg-gray-200 rounded" data-format="italic">
        <em>I</em>
      </button>
      <button title="Underline" class="px-2 py-1 hover:bg-gray-200 rounded" data-format="underline">
        <u>U</u>
      </button>
      <button title="Link" class="px-2 py-1 hover:bg-gray-200 rounded" data-format="link">
        🔗
      </button>
      <button title="Heading" class="px-2 py-1 hover:bg-gray-200 rounded" data-format="heading">
        H
      </button>
      <button title="Bullet List" class="px-2 py-1 hover:bg-gray-200 rounded" data-format="ul">
        • List
      </button>
    `;

    // Text editor
    const editor = document.createElement('textarea');
    editor.className = 'w-full p-3 border border-gray-300 rounded font-mono text-sm h-40 resize-none';
    editor.placeholder = 'Enter text or HTML...';
    editor.value = this.config.content;

    // Preview
    const preview = document.createElement('div');
    preview.className = 'p-3 bg-gray-50 border border-gray-200 rounded prose max-w-none text-sm';
    preview.innerHTML = this.config.content;

    // Update preview on change
    editor.addEventListener('input', () => {
      try {
        preview.innerHTML = editor.value;
      } catch (e) {
        preview.innerHTML = '<p style="color: red;">Invalid HTML</p>';
      }
    });

    // Save on blur
    editor.addEventListener('blur', () => {
      this.config.content = editor.value;
      if (this.onUpdate) {
        this.onUpdate({ ...this.config });
      }
    });

    // Format buttons
    toolbar.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const format = btn.getAttribute('data-format');
        this.applyFormat(editor, format);
      });
    });

    container.appendChild(toolbar);
    container.appendChild(editor);
    container.appendChild(preview);

    return container;
  }

  /**
   * Apply text formatting
   */
  applyFormat(textarea, format) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    let formatted = '';
    switch (format) {
      case 'bold':
        formatted = `<strong>${selected}</strong>`;
        break;
      case 'italic':
        formatted = `<em>${selected}</em>`;
        break;
      case 'underline':
        formatted = `<u>${selected}</u>`;
        break;
     case 'link': {
        const url = prompt('Enter URL:');
        formatted = `<a href="${url}">${selected}</a>`;
        break;
      }
      case 'heading':
        formatted = `<h2>${selected}</h2>`;
        break;
      case 'ul':
        formatted = `<ul><li>${selected}</li></ul>`;
        break;
      default:
        return;
    }

    const newText = text.substring(0, start) + formatted + text.substring(end);
    textarea.value = newText;

    // Update preview
    const preview = textarea.nextElementSibling;
    if (preview) {
      try {
        preview.innerHTML = newText;
      } catch (e) {
        preview.innerHTML = '<p style="color: red;">Invalid HTML</p>';
      }
    }

    // Trigger update
    if (this.onUpdate) {
      this.config.content = newText;
      this.onUpdate({ ...this.config });
    }
  }

  /**
   * Get block data
   */
  getData() {
    return this.config;
  }
}
