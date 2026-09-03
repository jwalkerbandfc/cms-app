/**
 * Block Factory - Registry for block types and block creation
 * Allows easy extension with new block types
 */

import { generateId } from '../lib/utils.js';

// Block type registry
const blockTypes = new Map();

/**
 * Register a new block type
 */
export function registerBlockType(type, config) {
  blockTypes.set(type, {
    type,
    label: config.label,
    icon: config.icon,
    description: config.description || '',
    defaultConfig: config.defaultConfig || {},
    render: config.render,
    edit: config.edit,
    validate: config.validate || (() => true)
  });
}

/**
 * Get registered block type
 */
export function getBlockType(type) {
  return blockTypes.get(type);
}

/**
 * Get all registered block types
 */
export function getAllBlockTypes() {
  return Array.from(blockTypes.values());
}

/**
 * Create new block instance with default config
 */
export function createBlockInstance(type, overrides = {}) {
  const blockType = getBlockType(type);
  if (!blockType) throw new Error(`Unknown block type: ${type}`);

  return {
    id: generateId('block'),
    type,
    config: {
      ...blockType.defaultConfig,
      ...overrides
    }
  };
}

/**
 * Render block in public view mode
 */
export function renderBlock(block, viewMode = 'public') {
  const blockType = getBlockType(block.type);
  if (!blockType) return createErrorElement(`Unknown block type: ${block.type}`);

  try {
    return blockType.render(block.config);
  } catch (error) {
    console.error(`Error rendering block ${block.id}:`, error);
    return createErrorElement(`Error rendering block: ${error.message}`);
  }
}

/**
 * Create block editor component
 */
export function createBlockEditor(block, onUpdate, onDelete) {
  const blockType = getBlockType(block.type);
  if (!blockType) return createErrorElement(`Unknown block type: ${block.type}`);

  const container = document.createElement('div');
  container.className = 'block-editor';
  container.setAttribute('data-block-id', block.id);

  const header = document.createElement('div');
  header.className = 'block-editor-header';
  header.innerHTML = `
    <div class="flex items-center gap-3">
      <span class="text-lg">${blockType.icon || '◆'}</span>
      <span class="font-medium">${blockType.label}</span>
    </div>
    <div class="flex gap-2">
      <button class="delete-btn" title="Delete block">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  `;

  const editor = document.createElement('div');
  editor.className = 'block-editor-content';

  // Call block's edit function
  try {
    blockType.edit(block.config, (updatedConfig) => {
      onUpdate({ ...block, config: updatedConfig });
    }, editor);
  } catch (error) {
    console.error(`Error editing block ${block.id}:`, error);
    editor.innerHTML = `<p class="text-red-600">Error: ${error.message}</p>`;
  }

  header.querySelector('.delete-btn').addEventListener('click', () => onDelete(block.id));

  container.appendChild(header);
  container.appendChild(editor);

  return container;
}

/**
 * Error display element
 */
function createErrorElement(message) {
  const div = document.createElement('div');
  div.className = 'p-4 bg-red-50 border border-red-200 rounded text-red-700';
  div.textContent = message;
  return div;
}

/**
 * BUILT-IN BLOCK TYPES
 */

// Text Block
registerBlockType('text', {
  label: 'Text',
  icon: '📝',
  description: 'Rich text paragraph',
  defaultConfig: {
    content: '<p>Start typing...</p>'
  },
  render(config) {
    const div = document.createElement('div');
    div.className = 'prose max-w-none';
    div.innerHTML = config.content;
    return div;
  },
  edit(config, onUpdate, container) {
    container.innerHTML = `
      <div class="space-y-3">
        <textarea 
          class="w-full p-2 border border-gray-300 rounded resize-none h-32 font-mono text-sm"
          placeholder="Enter HTML or plain text"
        >${config.content}</textarea>
        <div class="text-xs text-gray-500">
          Supports HTML formatting. Use &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;a&gt; tags.
        </div>
      </div>
    `;

    const textarea = container.querySelector('textarea');
    textarea.addEventListener('blur', () => {
      onUpdate({ content: textarea.value });
    });
  }
});

// Heading Block
registerBlockType('heading', {
  label: 'Heading',
  icon: '#',
  description: 'Heading text',
  defaultConfig: {
    text: 'Heading',
    level: 'h2'
  },
  render(config) {
    const element = document.createElement(config.level || 'h2');
    element.className = {
      h1: 'text-4xl font-bold',
      h2: 'text-3xl font-bold',
      h3: 'text-2xl font-bold',
      h4: 'text-xl font-bold'
    }[config.level] || 'text-2xl font-bold';
    element.textContent = config.text;
    return element;
  },
  edit(config, onUpdate, container) {
    container.innerHTML = `
      <div class="space-y-3">
        <input 
          type="text" 
          class="w-full p-2 border border-gray-300 rounded"
          placeholder="Heading text"
          value="${config.text || ''}"
        />
        <select class="w-full p-2 border border-gray-300 rounded">
          <option value="h1" ${config.level === 'h1' ? 'selected' : ''}>H1 - Largest</option>
          <option value="h2" ${config.level === 'h2' ? 'selected' : ''}>H2</option>
          <option value="h3" ${config.level === 'h3' ? 'selected' : ''}>H3</option>
          <option value="h4" ${config.level === 'h4' ? 'selected' : ''}>H4 - Smallest</option>
        </select>
      </div>
    `;

    const input = container.querySelector('input');
    const select = container.querySelector('select');

    input.addEventListener('blur', () => {
      onUpdate({ ...config, text: input.value });
    });

    select.addEventListener('change', () => {
      onUpdate({ ...config, level: select.value });
    });
  }
});

// Image Block
registerBlockType('image', {
  label: 'Image',
  icon: '🖼️',
  description: 'Single image with caption',
  defaultConfig: {
    src: '',
    alt: '',
    caption: '',
    width: '100%'
  },
  render(config) {
    const container = document.createElement('figure');
    container.className = 'my-6';

    const img = document.createElement('img');
    img.src = config.src;
    img.alt = config.alt;
    img.className = 'w-full rounded-lg';
    img.style.width = config.width;

    container.appendChild(img);

    if (config.caption) {
      const caption = document.createElement('figcaption');
      caption.textContent = config.caption;
      caption.className = 'text-sm text-gray-600 italic mt-2';
      container.appendChild(caption);
    }

    return container;
  },
  edit(config, onUpdate, container) {
    container.innerHTML = `
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium mb-1">Image URL</label>
          <input 
            type="text" 
            class="w-full p-2 border border-gray-300 rounded"
            placeholder="https://example.com/image.jpg"
            value="${config.src || ''}"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Alt Text</label>
          <input 
            type="text" 
            class="w-full p-2 border border-gray-300 rounded"
            placeholder="Description for accessibility"
            value="${config.alt || ''}"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Caption</label>
          <input 
            type="text" 
            class="w-full p-2 border border-gray-300 rounded"
            placeholder="Optional caption"
            value="${config.caption || ''}"
          />
        </div>
        ${config.src ? `<img src="${config.src}" alt="${config.alt}" class="w-full rounded border border-gray-200" />` : ''}
      </div>
    `;

    const inputs = container.querySelectorAll('input');
    inputs[0].addEventListener('blur', () => {
      onUpdate({ ...config, src: inputs[0].value });
      container.querySelector('img')?.remove();
      if (inputs[0].value) {
        const preview = document.createElement('img');
        preview.src = inputs[0].value;
        preview.className = 'w-full rounded border border-gray-200 mt-3';
        preview.onerror = () => preview.remove();
        container.appendChild(preview);
      }
    });
    inputs[1].addEventListener('blur', () => onUpdate({ ...config, alt: inputs[1].value }));
    inputs[2].addEventListener('blur', () => onUpdate({ ...config, caption: inputs[2].value }));
  }
});

// Video Block
registerBlockType('video', {
  label: 'Video',
  icon: '▶️',
  description: 'Embedded video (YouTube, Vimeo, or MP4)',
  defaultConfig: {
    url: '',
    type: 'youtube'
  },
  render(config) {
    const container = document.createElement('div');
    container.className = 'my-6 aspect-video bg-black rounded-lg overflow-hidden';

    if (config.type === 'youtube') {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${config.url}`;
      iframe.className = 'w-full h-full';
      iframe.allowFullscreen = true;
      container.appendChild(iframe);
    } else if (config.type === 'vimeo') {
      const iframe = document.createElement('iframe');
      iframe.src = `https://player.vimeo.com/video/${config.url}`;
      iframe.className = 'w-full h-full';
      iframe.allowFullscreen = true;
      container.appendChild(iframe);
    } else if (config.type === 'mp4') {
      const video = document.createElement('video');
      video.src = config.url;
      video.controls = true;
      video.className = 'w-full h-full';
      container.appendChild(video);
    }

    return container;
  },
  edit(config, onUpdate, container) {
    container.innerHTML = `
      <div class="space-y-3">
        <select class="w-full p-2 border border-gray-300 rounded">
          <option value="youtube" ${config.type === 'youtube' ? 'selected' : ''}>YouTube</option>
          <option value="vimeo" ${config.type === 'vimeo' ? 'selected' : ''}>Vimeo</option>
          <option value="mp4" ${config.type === 'mp4' ? 'selected' : ''}>MP4 URL</option>
        </select>
        <input 
          type="text" 
          class="w-full p-2 border border-gray-300 rounded"
          placeholder="Video ID or URL"
          value="${config.url || ''}"
        />
        <p class="text-xs text-gray-500">
          YouTube/Vimeo: enter video ID (e.g., dQw4w9WgXcQ). MP4: enter full URL.
        </p>
      </div>
    `;

    const select = container.querySelector('select');
    const input = container.querySelector('input');

    select.addEventListener('change', () => {
      onUpdate({ ...config, type: select.value });
    });

    input.addEventListener('blur', () => {
      onUpdate({ ...config, url: input.value });
    });
  }
});

// Spacer Block
registerBlockType('spacer', {
  label: 'Spacer',
  icon: '⬇️',
  description: 'Vertical spacing',
  defaultConfig: {
    height: '2rem'
  },
  render(config) {
    const div = document.createElement('div');
    div.style.height = config.height;
    return div;
  },
  edit(config, onUpdate, container) {
    container.innerHTML = `
      <div class="space-y-2">
        <label class="block text-sm font-medium">Height</label>
        <select class="w-full p-2 border border-gray-300 rounded">
          <option value="0.5rem" ${config.height === '0.5rem' ? 'selected' : ''}>Small (8px)</option>
          <option value="1rem" ${config.height === '1rem' ? 'selected' : ''}>Regular (16px)</option>
          <option value="2rem" ${config.height === '2rem' ? 'selected' : ''}>Medium (32px)</option>
          <option value="4rem" ${config.height === '4rem' ? 'selected' : ''}>Large (64px)</option>
          <option value="8rem" ${config.height === '8rem' ? 'selected' : ''}>Extra Large (128px)</option>
        </select>
      </div>
    `;

    container.querySelector('select').addEventListener('change', (e) => {
      onUpdate({ height: e.target.value });
    });
  }
});

// Divider Block
registerBlockType('divider', {
  label: 'Divider',
  icon: '─',
  description: 'Visual separator',
  defaultConfig: {
    style: 'solid'
  },
  render(config) {
    const hr = document.createElement('hr');
    hr.className = 'my-6 border-gray-300';
    if (config.style === 'dashed') hr.style.borderStyle = 'dashed';
    if (config.style === 'dotted') hr.style.borderStyle = 'dotted';
    return hr;
  },
  edit(config, onUpdate, container) {
    container.innerHTML = `
      <select class="w-full p-2 border border-gray-300 rounded">
        <option value="solid" ${config.style === 'solid' ? 'selected' : ''}>Solid</option>
        <option value="dashed" ${config.style === 'dashed' ? 'selected' : ''}>Dashed</option>
        <option value="dotted" ${config.style === 'dotted' ? 'selected' : ''}>Dotted</option>
      </select>
    `;

    container.querySelector('select').addEventListener('change', (e) => {
      onUpdate({ style: e.target.value });
    });
  }
});
