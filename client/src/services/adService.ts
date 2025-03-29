/**
 * Ad Service for HowTo.AI
 * This service provides functions to manage the ad loading and refreshing
 * process within the single-page application.
 */

/**
 * Refreshes ads by calling the Hilltopads refresh function if available
 * This should be called whenever page content changes substantially
 */
export function refreshAds() {
  try {
    // First, ensure that the ad containers are properly configured
    enhanceAdContainers();

    // Try to call HTP's refresh function if it exists
    if (window.HTP && typeof window.HTP.refreshAllSlots === 'function') {
      window.HTP.refreshAllSlots();
      console.log('Hilltopads refreshed');
    } 
    // Fallback to using the direct groptoxegri if available
    else if (window.groptoxegri && typeof window.groptoxegri.refresh === 'function') {
      window.groptoxegri.refresh();
      console.log('Ads refreshed via groptoxegri');
    }
    // Last resort - reload scripts
    else {
      // If no refresh function is available, we can trigger a reload of the ad scripts
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
    // Primary Hilltopads script
    const hilltopScript = document.createElement('script');
    hilltopScript.src = "//hilltopads.com/publisher/howtoai";
    hilltopScript.async = true;
    document.head.appendChild(hilltopScript);

    // Backup groptoxegri scripts
    const adScriptUrls = [
      "//groptoxegri.com/byXGV.sWdJGHlo0EYOWvcJ/Xe/mo9ou_ZYUclskOPhTSYUyPMRjoMG1DNsTmA/tiNOjYIzyZMRzfU/1vMUQz",
      "//groptoxegri.com/buX/V.sSdCGxlD0xYhWAcc/jeBmn9IufZpUpl/kWP/TEYCynMKjmMz5vMFjYMdtSNmj-IZy_MyzTk/ydNoAW"
    ];

    // Create and append backup script tags
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
 * Add additional attributes to ensure compatibility with the Hilltopads network
 */
function enhanceAdContainers() {
  try {
    // Make sure htpSlots is defined
    window.htpSlots = window.htpSlots || [];
    window.htAdSlots = window.htAdSlots || [];
    
    // Make sure ad containers are properly set up
    const adContainers = document.querySelectorAll('.ad-unit');
    
    if (adContainers.length > 0) {
      console.log('Ad containers enhanced');
    }
    
    // Update route information for SPA ad tracking
    if (window.HTP && typeof window.HTP.updateRouteInfo === 'function') {
      window.HTP.updateRouteInfo(window.location.pathname);
    }
  } catch (error) {
    console.error('Error enhancing ad containers:', error);
  }
}

/**
 * Initialize the ad service by defining the global ad container
 * This should be called when the application first loads
 */
export function initializeAdService() {
  console.log('Initializing ad service');
  
  // Define a global namespace for our ad service
  if (!window.HowToAI) {
    window.HowToAI = {
      ads: {
        refresh: refreshAds,
        reload: reloadAdScripts,
        enhance: enhanceAdContainers
      }
    };
  }

  // Enhance ad containers after DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceAdContainers);
  } else {
    enhanceAdContainers();
  }

  // Monitor route changes for SPA to refresh ads
  let lastPath = window.location.pathname;
  const intervalId = setInterval(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      console.log('Route changed, refreshing ads');
      lastPath = currentPath;
      enhanceAdContainers();
      refreshAds();
    }
  }, 500);
  
  // Cleanup on unmount
  window.addEventListener('beforeunload', () => {
    clearInterval(intervalId);
  });

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
    htpSlots: any[];
    htAdSlots: any[];
    HTP?: {
      refreshAllSlots?: () => void;
      updateRouteInfo?: (path: string) => void;
    };
    groptoxegri?: {
      refresh?: () => void;
    };
    HowToAI?: {
      ads: {
        refresh: () => void;
        reload: () => void;
        enhance: () => void;
      };
    };
  }
}

// Helper function to check if an error event is related to our ad providers
export function isAdRelatedError(event: ErrorEvent): boolean {
  if (typeof event.message !== 'string') return false;
  
  const message = event.message.toLowerCase();
  return !!(
    message.includes('htp') ||
    message.includes('hilltop') ||
    message.includes('groptoxegri') || 
    message.includes('ad') || 
    message.includes('advertisement')
  );
}