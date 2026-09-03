# CMS Setup & Deployment Guide

Complete step-by-step instructions for setting up and deploying the CMS.

## Phase 1: Local Development Setup (15-20 minutes)

### Step 1: Prerequisites Check

Verify you have installed:
```bash
node --version  # Should be v18+
npm --version   # Should be v8+
git --version   # Should be installed
```

### Step 2: Project Setup

```bash
# Clone the repository
git clone https://github.com/your-org/cms-app.git
cd cms-app

# Install dependencies
npm install

# Verify installation
npm run build --dry-run
```

### Step 3: Create Supabase Project

1. **Sign up for Supabase** (free tier available):
   - Go to https://supabase.com
   - Click "Start your project"
   - Create account with GitHub or email
   - Verify email

2. **Create organization and project**:
   - Create new organization (or use default)
   - Click "New Project"
   - Fill in:
     - Project name: "cms-app" (or your choice)
     - Database password: Generate strong password
     - Region: Select closest to you
   - Click "Create new project"
   - Wait for database initialization (~2 minutes)

3. **Get API credentials**:
   - Go to Project Settings (gear icon)
   - Click "API" tab
   - Copy these values:
     - **Project URL** → `VITE_SUPABASE_URL`
     - **anon public** key → `VITE_SUPABASE_ANON_KEY`
   - ⚠️ Save these securely, never commit to git

### Step 4: Setup Database

1. **Access SQL Editor**:
   - In Supabase dashboard
   - Click "SQL Editor" (left sidebar)
   - Click "New Query"

2. **Create schema**:
   - Open `schema.sql` from project root
   - Copy entire file
   - Paste into SQL query window
   - Click "Run"
   - Wait for success message

3. **Verify tables**:
   - Go to "Table Editor" (left sidebar)
   - Should see: `pages`, `blocks`, `media`, `audit_log`
   - Click each table to verify columns

### Step 5: Create Storage Bucket

1. **Navigate to Storage**:
   - In Supabase dashboard
   - Click "Storage" (left sidebar)

2. **Create bucket**:
   - Click "New bucket"
   - Name: `cms-media`
   - Make Public: Toggle ON
   - Click "Create bucket"

3. **Set bucket policies** (in Supabase dashboard):
   - Click bucket name
   - Go to "Policies" tab
   - Should show default policies allowing public read
   - Authenticated users can upload (auto-configured by RLS)

### Step 6: Configure Local Environment

```bash
# Copy template
cp .env.example .env.local

# Edit with your Supabase credentials
nano .env.local
# or edit .env.local in your editor
```

**Contents of `.env.local`**:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-key...
```

Save and close.

### Step 7: Create Test User

1. **In Supabase dashboard**:
   - Go to Authentication (left sidebar)
   - Click "Users" tab
   - Click "New user"

2. **Create admin user**:
   - Email: `admin@example.com`
   - Password: (set secure password)
   - Auto confirm user: Toggle ON
   - Click "Create user"

### Step 8: Run Development Server

```bash
npm run dev
```

You should see:
```
VITE v4.4.0 ready in 123 ms

➜  Local:   http://localhost:3000/
➜  Press h to show help
```

Browser opens automatically. If not:
- Go to http://localhost:3000
- Should see landing page with "Admin Panel" button

### Step 9: Test Admin Access

1. Click "Admin Panel"
2. You should see login redirect
3. For this CMS, the auth is stubbed - you can add proper auth

To add proper auth later:
- Use Supabase Auth UI component
- Or build custom login form using `signIn()` from `lib/supabaseClient.js`

### Step 10: Verify Setup

**Test creating a page**:

1. Create new file `test-page.js`:
```javascript
import * as db from './src/lib/db.js';

async function test() {
  try {
    const page = await db.createPage({
      title: 'Test Page',
      slug: 'test-page',
      description: 'Testing setup'
    });
    console.log('✓ Page created:', page);
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

test();
```

2. Run it:
```bash
node test-page.js
```

3. Should see success message
4. Delete `test-page.js`

---

## Phase 2: Customization (Optional, 15-30 minutes)

### Customize Block Types

Edit `src/components/BlockFactory.js`:

```javascript
// Add new block type
registerBlockType('custom', {
  label: 'Custom Block',
  icon: '✨',
  description: 'My custom block',
  defaultConfig: { title: '' },
  render(config) {
    const div = document.createElement('div');
    div.textContent = config.title;
    return div;
  },
  edit(config, onUpdate, container) {
    container.innerHTML = '<input placeholder="Title" />';
    container.querySelector('input').addEventListener('blur', (e) => {
      onUpdate({ title: e.target.value });
    });
  }
});
```

### Add Custom Styling

Edit `src/styles/main.css`:

```css
/* Add custom styles */
.my-custom-style {
  @apply text-blue-600 font-bold;
}
```

### Extend Database Schema

1. In Supabase SQL Editor:
```sql
ALTER TABLE public.pages ADD COLUMN seo_title TEXT;
ALTER TABLE public.pages ADD COLUMN seo_description TEXT;
```

2. Update `src/lib/db.js` to handle new fields

---

## Phase 3: Deployment Setup (10-15 minutes)

Choose one deployment platform:

### Option A: Cloudflare Pages (Recommended)

**1. Push to GitHub**:

```bash
# Initialize git repo if not done
git init
git add .
git commit -m "Initial CMS setup"
git branch -M main

# Add remote (create repo on GitHub first)
git remote add origin https://github.com/YOUR_USERNAME/cms-app.git
git push -u origin main
```

**2. Connect to Cloudflare**:

1. Go to https://pages.cloudflare.com
2. Click "Create a project"
3. "Connect to Git"
4. Authorize GitHub
5. Select your repository
6. Click "Begin setup"

**3. Configure build settings**:

- **Project name**: `cms-app` (or custom)
- **Production branch**: `main`
- **Framework**: (leave blank / select "None")
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (default)

**4. Environment variables**:

- Click "Environment variables"
- Add variable:
  - **Name**: `VITE_SUPABASE_URL`
  - **Value**: (paste from `.env.local`)
- Add another:
  - **Name**: `VITE_SUPABASE_ANON_KEY`
  - **Value**: (paste from `.env.local`)

**5. Deploy**:

- Click "Save and Deploy"
- Watch build progress
- Should complete in 2-3 minutes
- Your site is now live at `cms-app.pages.dev`

**Enable custom domain** (optional):
1. Go to project Settings
2. Custom domain
3. Enter domain name
4. Follow DNS setup instructions

### Option B: GitHub Pages

**1. Create `_config.yml`** in project root:

```yaml
baseurl: /cms-app
```

Update `vite.config.js`:
```javascript
export default defineConfig({
  base: '/cms-app/',
  // ... rest of config
});
```

**2. Create GitHub Actions workflow**:

Already included in `.github/workflows/deploy.yml`

**3. Push code**:

```bash
git push origin main
```

**4. Enable GitHub Pages**:

1. Go to repository Settings
2. Pages (left sidebar)
3. Source: Deploy from branch
4. Branch: `gh-pages`
5. Wait for build to complete
6. Site is live at `your-username.github.io/cms-app`

### Option C: Vercel

**1. Connect repository**:

1. Go to https://vercel.com/import
2. Click "Import Project"
3. Select "Import Git Repository"
4. Authorize GitHub
5. Select your repo

**2. Configure project**:

- **Framework Preset**: Select "Vite"
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

**3. Add environment variables**:

- Add `VITE_SUPABASE_URL`
- Add `VITE_SUPABASE_ANON_KEY`

**4. Deploy**:

- Click "Deploy"
- Wait for build
- Site is live at `cms-app.vercel.app`

**Add custom domain** (if you have one):
1. Project Settings → Domains
2. Add domain
3. Update DNS records

---

## Phase 4: Verify Production Deployment (5 minutes)

### Test deployed app:

1. **Go to your live URL**:
   - Cloudflare: `https://cms-app.pages.dev`
   - GitHub Pages: `https://your-username.github.io/cms-app`
   - Vercel: `https://cms-app.vercel.app`

2. **Check landing page**:
   - Should see CMS title and description
   - Buttons for "Admin Panel" and "View Pages"

3. **Test admin access**:
   - Click "Admin Panel"
   - Navigation should work
   - You'll see the page manager

4. **Create test page**:
   - Create new page
   - Add some content blocks
   - Publish page
   - Should be viewable

### Monitor deployment:

**Cloudflare**:
- Deployments tab shows build history
- Logs show any build errors

**GitHub**:
- Actions tab shows workflow runs
- Builds on push automatically

**Vercel**:
- Dashboard shows deployment history
- Rebuilds on push automatically

---

## Phase 5: Post-Deployment (Ongoing)

### Make changes and redeploy:

```bash
# Make changes to files
# Commit and push
git add .
git commit -m "Description of changes"
git push origin main

# Deployment happens automatically!
```

### Monitor usage:

**Supabase Analytics**:
- Dashboard shows API calls
- Storage usage
- Database queries

Monitor quotas:
- Free tier: 50k API calls/month
- 1GB storage
- Upgrade if needed

### Set up custom domain:

1. Buy domain (Route53, Namecheap, Cloudflare Registrar)
2. Update nameservers or CNAME record
3. Add to deployment platform
4. SSL certificate auto-generated

### Backup database:

**Supabase backups** (free tier):
- Weekly backups
- Enable in project settings
- Or export manually via SQL

---

## Troubleshooting

### Build failing?

```bash
# Clear cache and rebuild
rm -rf node_modules .next dist
npm install
npm run build
```

Check build logs on deployment platform for errors.

### Site not loading?

1. Check environment variables are set correctly
2. Verify Supabase project is still active
3. Check browser console for errors (F12)
4. Verify database schema exists

### Database not connecting?

1. Verify `VITE_SUPABASE_URL` is correct
2. Check `VITE_SUPABASE_ANON_KEY` is valid
3. Ensure RLS policies are enabled
4. Check table permissions in Supabase

### Storage bucket issues?

1. Verify bucket is public
2. Check bucket name matches `cms-media`
3. Ensure policies allow uploads
4. Check file size limits

---

## Next Steps

1. ✅ Complete setup from above
2. 📝 Add more block types as needed
3. 🎨 Customize styling
4. 👥 Setup multi-user permissions
5. 📊 Add analytics tracking
6. 🔔 Setup notifications
7. 🗄️ Implement backup strategy

Enjoy your CMS! 🎉
