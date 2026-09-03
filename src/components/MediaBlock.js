/**
 * MediaBlock Component - Image and video content block
 * Handles media uploads and embedding
 */

import { uploadImage, uploadVideo } from '../lib/storage.js';

export class MediaBlock {
  constructor(config = {}, onUpdate, onDelete) {
    this.config = {
      type: 'image', // 'image' or 'video'
      src: '',
      alt: '',
      caption: '',
      width: '100%',
      uploading: false,
      ...config
    };
    this.onUpdate = onUpdate;
    this.onDelete = onDelete;
  }

  /**
   * Render block in view mode
   */
  render() {
    if (this.config.type === 'image') {
      return this.renderImage();
    } else if (this.config.type === 'video') {
      return this.renderVideo();
    }
    return document.createElement('div');
  }

  /**
   * Render image
   */
  renderImage() {
    const figure = document.createElement('figure');
    figure.className = 'my-6';

    const img = document.createElement('img');
    img.src = this.config.src;
    img.alt = this.config.alt;
    img.className = 'w-full rounded-lg';
    img.style.width = this.config.width;

    figure.appendChild(img);

    if (this.config.caption) {
      const caption = document.createElement('figcaption');
      caption.textContent = this.config.caption;
      caption.className = 'text-sm text-gray-600 italic mt-2 text-center';
      figure.appendChild(caption);
    }

    return figure;
  }

  /**
   * Render video
   */
  renderVideo() {
    const container = document.createElement('div');
    container.className = 'my-6 aspect-video bg-black rounded-lg overflow-hidden';

    if (this.config.src.includes('youtube.com') || this.config.src.includes('youtu.be')) {
      const videoId = this.extractYoutubeId(this.config.src);
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${videoId}`;
      iframe.className = 'w-full h-full';
      iframe.allowFullscreen = true;
      container.appendChild(iframe);
    } else if (this.config.src.includes('vimeo.com')) {
      const videoId = this.extractVimeoId(this.config.src);
      const iframe = document.createElement('iframe');
      iframe.src = `https://player.vimeo.com/video/${videoId}`;
      iframe.className = 'w-full h-full';
      iframe.allowFullscreen = true;
      container.appendChild(iframe);
    } else {
      const video = document.createElement('video');
      video.src = this.config.src;
      video.controls = true;
      video.className = 'w-full h-full';
      container.appendChild(video);
    }

    if (this.config.caption) {
      const caption = document.createElement('p');
      caption.textContent = this.config.caption;
      caption.className = 'text-sm text-gray-600 italic mt-2 text-center';
      container.parentElement?.insertBefore(caption, container.nextSibling);
    }

    return container;
  }

  /**
   * Render block in edit mode
   */
  edit() {
    const container = document.createElement('div');
    container.className = 'media-block-editor space-y-4';

    // Type selector
    const typeGroup = document.createElement('div');
    typeGroup.innerHTML = `
      <label class="block text-sm font-medium mb-2">Media Type</label>
      <div class="flex gap-3">
        <label class="flex items-center gap-2">
          <input type="radio" name="media-type" value="image" ${this.config.type === 'image' ? 'checked' : ''} />
          Image
        </label>
        <label class="flex items-center gap-2">
          <input type="radio" name="media-type" value="video" ${this.config.type === 'video' ? 'checked' : ''} />
          Video
        </label>
      </div>
    `;

    // Image upload section
    const imageSection = document.createElement('div');
    imageSection.className = 'image-section space-y-3';
    imageSection.style.display = this.config.type === 'image' ? 'block' : 'none';
    imageSection.innerHTML = `
      <div>
        <label class="block text-sm font-medium mb-2">Upload Image</label>
        <div class="flex gap-2">
          <input 
            type="file" 
            accept="image/*" 
            class="image-file-input flex-1 p-2 border border-gray-300 rounded text-sm"
          />
          <button class="upload-image-btn px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Upload
          </button>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Or Image URL</label>
        <input 
          type="text" 
          class="image-url-input w-full p-2 border border-gray-300 rounded text-sm"
          placeholder="https://example.com/image.jpg"
          value="${this.config.src || ''}"
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Alt Text (accessibility)</label>
        <input 
          type="text" 
          class="alt-input w-full p-2 border border-gray-300 rounded text-sm"
          placeholder="Description of image"
          value="${this.config.alt || ''}"
        />
      </div>
      ${this.config.src ? `<img src="${this.config.src}" alt="${this.config.alt}" class="w-full rounded border border-gray-200 max-h-40 object-contain" />` : ''}
    `;

    // Video section
    const videoSection = document.createElement('div');
    videoSection.className = 'video-section space-y-3';
    videoSection.style.display = this.config.type === 'video' ? 'block' : 'none';
    videoSection.innerHTML = `
      <div>
        <label class="block text-sm font-medium mb-2">Upload or Embed Video</label>
        <div class="space-y-2">
          <div>
            <label class="text-xs text-gray-600">Upload MP4/WebM</label>
            <div class="flex gap-2">
              <input 
                type="file" 
                accept="video/*" 
                class="video-file-input flex-1 p-2 border border-gray-300 rounded text-sm"
              />
              <button class="upload-video-btn px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Upload
              </button>
            </div>
          </div>
          <div>
            <label class="text-xs text-gray-600">Or paste YouTube/Vimeo URL</label>
            <input 
              type="text" 
              class="video-url-input w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
              value="${this.config.src || ''}"
            />
          </div>
        </div>
      </div>
    `;

    // Caption
    const captionGroup = document.createElement('div');
    captionGroup.innerHTML = `
      <label class="block text-sm font-medium mb-1">Caption (optional)</label>
      <input 
        type="text" 
        class="caption-input w-full p-2 border border-gray-300 rounded text-sm"
        placeholder="Optional caption for image/video"
        value="${this.config.caption || ''}"
      />
    `;

    // Event listeners
    typeGroup.querySelectorAll('input[name="media-type"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.config.type = e.target.value;
        imageSection.style.display = this.config.type === 'image' ? 'block' : 'none';
        videoSection.style.display = this.config.type === 'video' ? 'block' : 'none';
        if (this.onUpdate) this.onUpdate({ ...this.config });
      });
    });

    // Image upload
    const uploadImageBtn = imageSection.querySelector('.upload-image-btn');
    const imageFileInput = imageSection.querySelector('.image-file-input');
    uploadImageBtn?.addEventListener('click', async () => {
      const file = imageFileInput?.files?.[0];
      if (!file) return;

      uploadImageBtn.disabled = true;
      uploadImageBtn.textContent = 'Uploading...';

      try {
        const url = await uploadImage(file);
        this.config.src = url;
        imageSection.querySelector('.image-url-input').value = url;

        // Show preview
        const preview = imageSection.querySelector('img');
        if (preview) {
          preview.src = url;
        } else {
          const newPreview = document.createElement('img');
          newPreview.src = url;
          newPreview.className = 'w-full rounded border border-gray-200 max-h-40 object-contain mt-2';
          imageSection.appendChild(newPreview);
        }

        if (this.onUpdate) this.onUpdate({ ...this.config });
      } catch (error) {
        alert(`Upload failed: ${error.message}`);
      } finally {
        uploadImageBtn.disabled = false;
        uploadImageBtn.textContent = 'Upload';
        imageFileInput.value = '';
      }
    });

    // Image URL update
    imageSection.querySelector('.image-url-input')?.addEventListener('blur', (e) => {
      this.config.src = e.target.value;
      if (this.onUpdate) this.onUpdate({ ...this.config });
    });

    // Alt text update
    imageSection.querySelector('.alt-input')?.addEventListener('blur', (e) => {
      this.config.alt = e.target.value;
      if (this.onUpdate) this.onUpdate({ ...this.config });
    });

    // Video upload
    const uploadVideoBtn = videoSection.querySelector('.upload-video-btn');
    const videoFileInput = videoSection.querySelector('.video-file-input');
    uploadVideoBtn?.addEventListener('click', async () => {
      const file = videoFileInput?.files?.[0];
      if (!file) return;

      uploadVideoBtn.disabled = true;
      uploadVideoBtn.textContent = 'Uploading...';

      try {
        const url = await uploadVideo(file);
        this.config.src = url;
        videoSection.querySelector('.video-url-input').value = url;
        if (this.onUpdate) this.onUpdate({ ...this.config });
      } catch (error) {
        alert(`Upload failed: ${error.message}`);
      } finally {
        uploadVideoBtn.disabled = false;
        uploadVideoBtn.textContent = 'Upload';
        videoFileInput.value = '';
      }
    });

    // Video URL update
    videoSection.querySelector('.video-url-input')?.addEventListener('blur', (e) => {
      this.config.src = e.target.value;
      if (this.onUpdate) this.onUpdate({ ...this.config });
    });

    // Caption update
    captionGroup.querySelector('.caption-input')?.addEventListener('blur', (e) => {
      this.config.caption = e.target.value;
      if (this.onUpdate) this.onUpdate({ ...this.config });
    });

    container.appendChild(typeGroup);
    container.appendChild(imageSection);
    container.appendChild(videoSection);
    container.appendChild(captionGroup);

    return container;
  }

  /**
   * Extract YouTube video ID
   */
  extractYoutubeId(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : '';
  }

  /**
   * Extract Vimeo video ID
   */
  extractVimeoId(url) {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : '';
  }

  /**
   * Get block data
   */
  getData() {
    return this.config;
  }
}
