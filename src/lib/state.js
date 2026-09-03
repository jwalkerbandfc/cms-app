/**
 * Lightweight state management system
 * Decoupled from UI framework to support easy updates and testing
 */

let globalState = {
  // Auth
  user: null,
  isAuthenticated: false,
  loading: false,

  // Pages
  pages: [],
  currentPage: null,
  currentPageId: null,

  // Blocks
  blocks: [],
  selectedBlockId: null,

  // UI
  sidebarOpen: true,
  toast: null,
  modal: null,

  // Cache
  cachedPages: new Map()
};

// Subscribers
const subscribers = new Set();

/**
 * Get current state
 */
export function getState() {
  return { ...globalState };
}

/**
 * Update state (immutable)
 */
export function setState(updates) {
  const prevState = { ...globalState };
  globalState = { ...globalState, ...updates };

  // Notify subscribers only if state changed
  if (JSON.stringify(prevState) !== JSON.stringify(globalState)) {
    notifySubscribers();
  }
}

/**
 * Deep update nested objects
 */
export function updateState(path, value) {
  const keys = path.split('.');
  const newState = JSON.parse(JSON.stringify(globalState));
  let current = newState;

  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }

  current[keys[keys.length - 1]] = value;
  globalState = newState;
  notifySubscribers();
}

/**
 * Subscribe to state changes
 */
export function subscribe(callback) {
  subscribers.add(callback);

  // Return unsubscribe function
  return () => {
    subscribers.delete(callback);
  };
}

/**
 * Notify all subscribers
 */
function notifySubscribers() {
  subscribers.forEach(callback => {
    try {
      callback(globalState);
    } catch (error) {
      console.error('Subscriber error:', error);
    }
  });
}

/**
 * Reset state to initial
 */
export function resetState() {
  globalState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    pages: [],
    currentPage: null,
    currentPageId: null,
    blocks: [],
    selectedBlockId: null,
    sidebarOpen: true,
    toast: null,
    modal: null,
    cachedPages: new Map()
  };
  notifySubscribers();
}

/**
 * Convenience methods
 */

export function setUser(user) {
  setState({ user, isAuthenticated: !!user });
}

export function setLoading(loading) {
  setState({ loading });
}

export function setPages(pages) {
  setState({ pages });
}

export function setCurrentPage(page) {
  setState({ currentPage: page, currentPageId: page?.id || null });
}

export function setBlocks(blocks) {
  setState({ blocks });
}

export function setSelectedBlock(blockId) {
  setState({ selectedBlockId: blockId });
}

export function showToast(message, type = 'info', duration = 3000) {
  setState({ toast: { message, type, id: Date.now() } });
  if (duration) {
    setTimeout(() => {
      setState({ toast: null });
    }, duration);
  }
}

export function showModal(modalConfig) {
  setState({ modal: { ...modalConfig, id: Date.now() } });
}

export function closeModal() {
  setState({ modal: null });
}

export function toggleSidebar() {
  setState({ sidebarOpen: !globalState.sidebarOpen });
}
