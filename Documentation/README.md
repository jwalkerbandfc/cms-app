# CMS - Lightweight Content Management System

A production-ready, modular CMS designed to run as a static web app on Cloudflare Pages or GitHub Pages, backed by Supabase.

## 🎯 Features

- **Dynamic Page Management**: Create, edit, publish, and delete pages
- **Visual Drag-and-Drop Editor**: Reorder content blocks with intuitive UI
- **Rich Block Types**: Text, headings, images, videos, galleries, spacers, dividers
- **Media Management**: Upload images and videos directly to Supabase Storage
- **Real-time Collaboration Ready**: Database-backed, supports live updates
- **Role-Based Access Control**: Row Level Security (RLS) for multi-user environments
- **Mobile Responsive**: Full-featured admin interface and public-facing pages
- **Zero Build Complexity**: Vite + Vanilla JS, minimal dependencies

## 📋 Tech Stack

- **Frontend**: Vanilla JavaScript (ES Modules), Tailwind CSS, Sortable.js
- **Editor**: Tiptap rich text editor
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Build**: Vite
- **Deployment**: Cloudflare Pages / GitHub Pages

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project ([Sign up free](https://supabase.com))
- Git

### 1. Clone & Install

```bash
git clone <repo-url> cms-app
cd cms-app
npm install
```

### 2. Setup Supabase Project

1. **Create a new Supabase project** at https://supabase.com
2. **Run the schema** (schema.sql):
   - Go to Supabase Dashboard → SQL Editor
   - Create new query
   - Paste entire `schema.sql` file
   - Click "Run"

3. **Create Storage Bucket**:
   - Go to Storage → New bucket
   - Name: `cms-media`
   - Make it public (for images/videos)

4. **Get API Keys**:
   - Go to Settings → API
   - Copy `Project URL` (VITE_SUPABASE_URL)
   - Copy `anon` (public) key (VITE_SUPABASE_ANON_KEY)
   - ⚠️ **Never use Service Role Key** in frontend code

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Setup Authentication (Supabase)

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Email provider
3. Configure email settings as needed

For testing locally:
- Go to Authentication → Users
- Click "New user" to create test admin account

### 5. Run Development Server

```bash
npm run dev
```

Opens automatically at `http://localhost:3000`

### 6. Build for Production

```bash
npm run build
```

Outputs optimized code to `/dist` directory.

## 📁 Project Structure

```
cms-app/
├── src/
│   ├── components/
│   │   ├── BlockFactory.js       # Block type registry & creation
│   │   ├── Canvas.js             # Drag-drop editor
│   │   ├── Sidebar.js            # Block insertion controls
│   │   ├── PageManager.js        # Page CRUD interface
│   │   ├── PublicView.js         # Public page renderer
│   │   ├── Modal.js              # Modal dialogs
│   │   └── Toast.js              # Toast notifications
│   ├── lib/
│   │   ├── supabaseClient.js     # Supabase client setup
│   │   ├── db.js                 # Database operations
│   │   ├── storage.js            # File upload/management
│   │   ├── state.js              # Global state management
│   │   └── utils.js              # Utility functions
│   ├── styles/
│   │   └── main.css              # Tailwind + custom CSS
│   ├── pages/
│   │   ├── admin.html            # Admin editor
│   │   └── view.html             # Public page viewer
│   └── main.js                   # App entry point
├── public/
│   └── index.html                # Landing page
├── schema.sql                    # Database schema + RLS
├── package.json                  # Dependencies
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind configuration
└── README.md                     # This file
```

## 🔧 Configuration

### Block Types

Customize available block types in `src/components/BlockFactory.js`:

```javascript
registerBlockType('myblock', {
  label: 'My Block',
  icon: '📦',
  description: 'Custom block type',
  defaultConfig: { /* default values */ },
  render(config) {
    // Render for public view
    const el = document.createElement('div');
    el.textContent = config.content;
    return el;
  },
  edit(config, onUpdate, container) {
    // Render editor UI
    container.innerHTML = '<input placeholder="Enter text" />';
    container.querySelector('input').addEventListener('blur', (e) => {
      onUpdate({ ...config, content: e.target.value });
    });
  }
});
```

### Adding Fields to Pages

Extend page metadata in `schema.sql`:

```sql
ALTER TABLE public.pages ADD COLUMN seo_keywords TEXT;
ALTER TABLE public.pages ADD COLUMN featured_image UUID REFERENCES public.media(id);
```

Update `src/lib/db.js` to handle new fields in CRUD operations.

### Styling

Tailwind CSS is configured in `tailwind.config.js`. All components use Tailwind utility classes.

Custom CSS can be added to `src/styles/main.css`.

## 🔐 Security

### Row Level Security (RLS)

Database is fully secured with RLS policies:

- **Published pages** are readable by anyone
- **Draft pages** are only accessible to authenticated creators
- **Blocks** follow parent page permissions
- **Uploads** are isolated by user

### Frontend Security

- ✅ Never expose `SERVICE_ROLE_KEY` in frontend
- ✅ Use public `ANON_KEY` with RLS policies
- ✅ Storage buckets have policies enforcing auth
- ✅ User IDs are captured from auth context, not user input

### Environment Variables

- Store sensitive keys in `.env` (local) or deployment platform
- Only expose `VITE_*` prefixed variables to frontend

## 🚢 Deployment

### Cloudflare Pages

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/user/cms-app.git
git push -u origin main
```

2. **Connect to Cloudflare**:
   - Go to Cloudflare Pages
   - Create new project → Connect Git
   - Select your repo
   - Build settings:
     - Framework: None
     - Build command: `npm run build`
     - Build output directory: `dist`

3. **Add environment variables**:
   - Settings → Environment
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

4. **Deploy**: Commits to main branch auto-deploy

### GitHub Pages

1. **Create `.github/workflows/deploy.yml`**:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

2. **Update vite.config.js**:
```javascript
export default {
  base: '/cms-app/', // Your repo name
  // ... rest of config
};
```

3. **Enable Pages**:
   - Repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: gh-pages

### Vercel

1. **Push to GitHub** (same as Cloudflare)

2. **Import to Vercel**:
   - Go to vercel.com → New Project
   - Import your GitHub repo
   - Vercel auto-detects Vite
   - Add env variables
   - Deploy

## 📝 Usage Guide

### Creating a Page

1. Go to admin panel: `/admin.html`
2. Click "New Page"
3. Enter title and description
4. Slug is auto-generated
5. Click "Create"

### Editing Content

1. Select page from list
2. Use sidebar to add blocks
3. Drag blocks to reorder
4. Click each block to edit
5. Click "Save Changes"

### Publishing

1. Make sure all content is correct
2. Click "Publish" button in sidebar
3. Page becomes public at `view.html?slug=your-page-slug`
4. Click "Preview" to see live version

### Media Management

Images and videos are stored in Supabase:

- **Images**: Upload via image block, 5MB max
- **Videos**: MP4/WebM direct upload or YouTube/Vimeo embeds
- **Access**: All media is public via signed URLs

## 🔄 API Reference

### Pages

```javascript
import * as db from './lib/db.js';

// Get all pages (admin only)
const pages = await db.getPages(isAdmin = true);

// Get single page
const page = await db.getPage(slugOrId, isAdmin = true);

// Create page
const newPage = await db.createPage({
  title: 'My Page',
  slug: 'my-page',
  description: 'Page description'
});

// Update page
await db.updatePage(pageId, {
  title: 'Updated Title',
  published: true
});

// Delete page
await db.deletePage(pageId);
```

### Blocks

```javascript
// Get blocks for a page
const blocks = await db.getBlocks(pageId);

// Create block
const block = await db.createBlock(pageId, {
  type: 'text',
  config: { content: '<p>Hello</p>' }
});

// Update block
await db.updateBlock(blockId, { content: '<p>Updated</p>' });

// Delete block
await db.deleteBlock(blockId);

// Reorder blocks
await db.reorderBlocks([
  { id: 'block1' },
  { id: 'block2' },
  { id: 'block3' }
]);
```

### Storage

```javascript
import * as storage from './lib/storage.js';

// Upload image
const url = await storage.uploadImage(file, 'images');

// Upload video
const url = await storage.uploadVideo(file, 'videos');

// Delete file
await storage.deleteFile(filepath);

// List files
const files = await storage.listFiles('images', limit = 50);
```

### State Management

```javascript
import * as state from './lib/state.js';

// Get current state
const currentState = state.getState();

// Update state
state.setState({ user: userData, pages: pagesList });

// Deep update
state.updateState('currentPage.published', true);

// Subscribe to changes
const unsubscribe = state.subscribe((newState) => {
  console.log('State changed:', newState);
});

// Show notifications
state.showToast('Changes saved!', 'success');
state.showToast('Error occurred', 'error');

// Show modal
state.showModal({
  title: 'Confirm',
  content: 'Are you sure?',
  actions: [
    { label: 'Yes', onClick: () => { /* ... */ } },
    { label: 'No', onClick: () => state.closeModal() }
  ]
});
```

## 🐛 Troubleshooting

### Pages not loading
- Check Supabase URL and key in `.env`
- Verify RLS policies are enabled
- Check browser console for errors

### Authentication not working
- Ensure email provider is enabled in Supabase
- Check user exists in Supabase dashboard
- Clear browser cookies and try again

### Images not uploading
- Verify `cms-media` bucket exists
- Check bucket is public (if using public URLs)
- Check file size < 5MB
- Verify image mime type (JPEG, PNG, WebP, SVG)

### Blocks not appearing in public view
- Ensure page is published
- Check blocks exist in database
- Verify block type is registered in BlockFactory

## 📚 Extended Learning

### Adding New Block Types

1. Define render and edit functions
2. Register with BlockFactory.js
3. Add UI for configuration
4. Test in editor
5. Publish

Example: Custom "Quote" block

```javascript
registerBlockType('quote', {
  label: 'Quote',
  icon: '❝',
  description: 'Pull quote or testimonial',
  defaultConfig: {
    text: 'Add quote text...',
    author: 'Author name'
  },
  render(config) {
    const blockquote = document.createElement('blockquote');
    blockquote.className = 'border-l-4 border-blue-500 pl-4 italic my-6';
    blockquote.innerHTML = `
      <p>"${config.text}"</p>
      ${config.author ? `<footer class="text-sm text-gray-600 mt-2">— ${config.author}</footer>` : ''}
    `;
    return blockquote;
  },
  edit(config, onUpdate, container) {
    container.innerHTML = `
      <div class="space-y-3">
        <textarea class="w-full p-2 border rounded" placeholder="Quote text">${config.text}</textarea>
        <input type="text" class="w-full p-2 border rounded" placeholder="Author" value="${config.author || ''}" />
      </div>
    `;

    const [textarea, input] = container.querySelectorAll('textarea, input');
    textarea.addEventListener('blur', () => onUpdate({ ...config, text: textarea.value }));
    input.addEventListener('blur', () => onUpdate({ ...config, author: input.value }));
  }
});
```

### Customizing UI

All UI uses Tailwind CSS. Modify:
- `tailwind.config.js` for theme
- `src/styles/main.css` for component styles
- Tailwind classes directly in components

### Database Queries

Raw queries can be executed via Supabase client:

```javascript
import { supabase } from './lib/supabaseClient.js';

const { data, error } = await supabase
  .from('pages')
  .select('*')
  .eq('published', true)
  .order('created_at', { ascending: false });
```

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

- GitHub Issues: [Report bugs](https://github.com/user/cms-app/issues)
- Documentation: See inline code comments
- Supabase Docs: https://supabase.com/docs

## 🎉 Credits

Built with:
- [Supabase](https://supabase.com) - Backend & Database
- [Vite](https://vitejs.dev) - Build tool
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Sortable.js](https://sortablejs.github.io/Sortable/) - Drag & drop
- [Tiptap](https://tiptap.dev) - Rich text editor
