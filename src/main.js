/**
 * CMS Application Entry Point
 * Initializes the app based on the current page
 */

import { getAuthStatus, getCurrentUser, onAuthStateChange, signOut } from './lib/supabaseClient.js';
import * as state from './lib/state.js';
import { Modal } from './components/Modal.js';
import { Toast } from './components/Toast.js';
import { Canvas } from './components/Canvas.js';
import { Sidebar } from './components/Sidebar.js';
import { PageManager } from './components/PageManager.js';
import { PublicView } from './components/PublicView.js';
import { getQueryParam } from './lib/utils.js';

// Global instances
let modal, toast, canvas, sidebar, pageManager, publicView;

/**
 * Initialize the application
 */
async function init() {
  // Get current page type from script data attribute
  const script = document.currentScript;
  const pageType = script?.getAttribute('data-page') || 'admin';

  // Setup UI containers
  setupUIContainers();

  // Check authentication
  const session = await getAuthStatus();
  const user = await getCurrentUser();

  if (pageType === 'admin' && !user) {
    // Redirect to login
    redirectToLogin();
    return;
  }

  // Setup state
  state.setUser(user);

  // Setup listeners
  setupAuthListeners();
  setupLogoutButton();

  // Initialize page-specific UI
  if (pageType === 'admin') {
    await initAdminPage();
  } else if (pageType === 'view') {
    await initPublicView();
  } else {
    // Default page list
    await initPageManager();
  }
}

/**
 * Setup UI containers
 */
function setupUIContainers() {
  const modalContainer = document.getElementById('modal-container');
  const toastContainer = document.getElementById('toast-container');

  if (modalContainer) {
    modal = new Modal(modalContainer);
  }

  if (toastContainer) {
    toast = new Toast(toastContainer);
  }
}

/**
 * Initialize admin editor page
 */
async function initAdminPage() {
  const sidebarContainer = document.getElementById('sidebar-container');
  const canvasContainer = document.getElementById('canvas-container');
  const pageTitle = document.getElementById('page-title');

  if (!sidebarContainer || !canvasContainer) {
    console.error('Missing admin containers');
    return;
  }

  // Initialize sidebar and canvas
  sidebar = new Sidebar(sidebarContainer);
  canvas = new Canvas(canvasContainer, null);

  // Get page ID from query param or create new
  const pageId = getQueryParam('page');

  if (pageId) {
    try {
      state.setLoading(true);

      const { getBlocks } = await import('./lib/db.js');
      const { getPage } = await import('./lib/db.js');

      const page = await getPage(pageId, true);
      if (!page) {
        state.showToast('Page not found', 'error');
        window.location.href = '/admin.html';
        return;
      }

      // Load page and blocks
      state.setCurrentPage(page);
      const blocks = await getBlocks(pageId);
      state.setBlocks(blocks);

      pageTitle.textContent = page.title;
    } catch (error) {
      console.error('Load page error:', error);
      state.showToast(`Error: ${error.message}`, 'error');
    } finally {
      state.setLoading(false);
    }
  } else {
    // Show page manager to select/create page
    pageTitle.textContent = 'Pages';
    pageManager = new PageManager(canvasContainer);
  }
}

/**
 * Initialize public page viewer
 */
async function initPublicView() {
  const pageContainer = document.getElementById('page-container');

  if (!pageContainer) {
    console.error('Missing page container');
    return;
  }

  publicView = new PublicView(pageContainer);
  await publicView.init();
}

/**
 * Initialize page manager (admin list view)
 */
async function initPageManager() {
  const mainContainer = document.querySelector('main') || document.body;

  pageManager = new PageManager(mainContainer);
}

/**
 * Setup authentication listeners
 */
function setupAuthListeners() {
  onAuthStateChange((event, session) => {
    if (!session) {
      redirectToLogin();
    } else {
      state.setUser(session.user);
    }
  });
}

/**
 * Setup logout button
 */
function setupLogoutButton() {
  const logoutBtn = document.getElementById('logout-btn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await signOut();
        window.location.href = '/';
      } catch (error) {
        state.showToast(`Logout error: ${error.message}`, 'error');
      }
    });
  }
}

/**
 * Redirect to login page
 */
function redirectToLogin() {
  // For now, redirect to home (would implement auth form in real app)
  window.location.href = '/auth.html';
}

/**
 * Handle loading state
 */
state.subscribe((newState) => {
  const indicator = document.getElementById('loading-indicator');
  if (indicator) {
    indicator.classList.toggle('hidden', !newState.loading);
  }
});

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for testing
export { init };
