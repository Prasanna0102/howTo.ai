/**
 * Ad Service for HowTo.AI
 * This service provides functions to manage the ad loading and refreshing
 * process within the single-page application.
 */

/**
 * Refreshes ads by calling the ad provider's refresh function if available
 * This should be called whenever page content changes substantially
 */
export function refreshAds() {
  try {
    // Attempt to access the ad provider's refresh function
    // Different ad networks have different methods - this is a common pattern
    if (window.groptoxegri && typeof window.groptoxegri.refresh === 'function') {
      window.groptoxegri.refresh();
      console.log('Ads refreshed');
    } else {
      // If the refresh function isn't available, we can trigger a reload of the ad scripts
      console.log('Ad refresh function not available, reloading scripts');
      reloadAdScripts();
    }
  } catch (error) {
    console.error('Error refreshing ads:', error);
  }
}

/**
 * Reloads the ad scripts by recreating the script elements
 * This is a fallback method if the ad provider doesn't offer a refresh function
 */
function reloadAdScripts() {
  try {
    // Define the ad script URLs (same as in index.html)
    const adScriptUrls = [
      "//groptoxegri.com/byXGV.sWdJGHlo0EYOWvcJ/Xe/mo9ou_ZYUclskOPhTSYUyPMRjoMG1DNsTmA/tiNOjYIzyZMRzfU/1vMUQz",
      "//groptoxegri.com/b/XFVMs/d.Gvl/0GYbWQcY/jeymD9JuqZuUulhk/P_TVYNybM/joMY1nNOjZAitbNojHIgy/MhzqUB2FMGQ-"
    ];

    // Create and append new script tags
    adScriptUrls.forEach(url => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.referrerPolicy = 'no-referrer-when-downgrade';
      document.head.appendChild(script);
    });

    console.log('Ad scripts reloaded');
  } catch (error) {
    console.error('Error reloading ad scripts:', error);
  }
}

/**
 * Initialize the ad service by defining the global ad container
 * This should be called when the application first loads
 */
export function initializeAdService() {
  // Define a global namespace for our ad service
  if (!window.HowToAI) {
    window.HowToAI = {
      ads: {
        refresh: refreshAds,
        reload: reloadAdScripts
      }
    };
  }

  // Attach to global error event to monitor ad-related errors
  window.addEventListener('error', (event) => {
    if (isAdRelatedError(event)) {
      console.error('Ad script error:', event.message);
    }
  });

  console.log('Ad service initialized');
}

// Define global types
declare global {
  interface Window {
    groptoxegri?: {
      refresh?: () => void;
    };
    HowToAI?: {
      ads: {
        refresh: () => void;
        reload: () => void;
      };
    };
  }
}

// Helper function to check if an error event is related to our ad provider
export function isAdRelatedError(event: ErrorEvent): boolean {
  if (typeof event.message !== 'string') return false;
  
  const message = event.message.toLowerCase();
  return !!(
    message.includes('groptoxegri') || 
    message.includes('ad') || 
    message.includes('advertisement')
  );
}