# CMS Codebase Structure

```
cms-app/
├── src/
│   ├── components/
│   │   ├── TextBlock.js          # Rich text editing component
│   │   ├── MediaBlock.js         # Image/video upload & embed
│   │   ├── Canvas.js             # Main drag-drop canvas editor
│   │   ├── Sidebar.js            # Block insertion sidebar
│   │   ├── Editor.js             # Main editor page layout
│   │   ├── PageManager.js        # Page CRUD interface
│   │   ├── PublicView.js         # Public page renderer
│   │   ├── BlockFactory.js       # Block type registry & creation
│   │   └── Modal.js              # Reusable modal component
│   ├── lib/
│   │   ├── supabaseClient.js     # Supabase client initialization
│   │   ├── db.js                 # Database operations (pages, blocks)
│   │   ├── state.js              # Global state management
│   │   ├── storage.js            # Supabase Storage operations
│   │   └── utils.js              # Utility functions
│   ├── styles/
│   │   └── main.css              # Tailwind + custom CSS
│   ├── pages/
│   │   ├── admin.html            # Admin editor page
│   │   └── view.html             # Public page viewer
│   └── main.js                   # App entry point
├── public/
│   └── index.html                # Landing/redirect page
├── schema.sql                    # Complete Supabase schema + RLS
├── package.json                  # Dependencies and scripts
├── vite.config.js                # Vite configuration
├── .env.example                  # Environment variables template
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions CI/CD
├── wrangler.toml                 # Cloudflare Pages config (optional)
├── README.md                     # Complete setup & deployment guide
└── .gitignore
```

## Architecture Overview

### Core Concepts

**Page Model:**
- Each page has a unique slug, title, and array of blocks
- Pages can be published (public) or draft (admin-only)
- Timestamps for creation, modification, and publication

**Block Model:**
- Modular components (TextBlock, MediaBlock, etc.)
- Blocks reference a type, configuration, and order
- Blocks are stored with their parent page_id

**Block Types:**
```javascript
{
  type: 'text',          // Rich text editor
  type: 'heading',       // H1, H2, H3 text
  type: 'image',         // Single image upload + caption
  type: 'video',         // Embed video (YouTube/Vimeo/MP4)
  type: 'gallery',       // Multiple images grid
  type: 'spacer',        // Vertical spacing
  type: 'divider'        // Visual separator
}
```

### State Management

Simple, decoupled state layer:
- Global state holds: current page, blocks, user auth status
- State updates via immutable operations
- UI subscribes to state changes
- No Redux/Vuex complexity for lightweight deployment

### Security Model

- Supabase RLS policies:
  - Only authenticated admins can modify pages/blocks
  - Public can view published pages
  - Service role keys never exposed to frontend
  - Public anon key restricted via bucket policies

### Deployment Flow

```
Local Dev → npm run dev
    ↓
Build → npm run build (outputs /dist)
    ↓
Deploy to Cloudflare Pages / GitHub Pages
    ↓
Points to same Supabase instance
```

## Tech Stack Rationale

- **Vite**: Fast bundler with HMR, zero-config deployment to static hosts
- **Vanilla JS + ES Modules**: No React overhead, smaller bundle, tree-shakeable
- **Tailwind CSS**: Utility-first, minimal CSS footprint
- **Supabase**: PostgreSQL with auth, real-time subscriptions, storage
- **Tiptap**: Headless rich text editor, highly customizable
- **SortableJS**: Lightweight drag-drop for canvas reordering

All dependencies are production-grade and actively maintained.
