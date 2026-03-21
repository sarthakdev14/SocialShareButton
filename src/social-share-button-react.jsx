import { useEffect, useRef } from "react";

/**
 * SocialShareButton React Wrapper
 *
 * Provides a React functional component that wraps the core SocialShareButton 
 * vanilla JS library. Handles lifecycle, dynamic updates, and provides 
 * sensible defaults for all sharing options.
 *
 * @param {Object} props - Component props for configuring the share button
 * @param {string} props.url - URL to share
 * @param {string} props.title - Title of the content
 * @param {string} props.description - Description for sharing
 * @param {Array<string>} props.platforms - Platforms to display
 * @param {boolean} props.analytics - Enable analytics events
 */
export const SocialShareButton = ({
  url,
  title,
  description = "",
  hashtags = [],
  via = "",
  platforms = ["whatsapp", "facebook", "twitter", "linkedin", "telegram", "reddit", "pinterest"],
  theme = "dark",
  buttonText = "Share",
  customClass = "",
  buttonColor = "",
  buttonHoverColor = "",
  showButton = true,
  onShare = null,
  onCopy = null,
  buttonStyle = "default",
  modalPosition = "center",
  
  // Analytics props — the library emits events but never collects data itself.
  analytics = true,
  onAnalytics = null, // (payload) => void hook
  analyticsPlugins = [], // Array of adapter instances (see social-share-analytics.js)
  componentId = null, // Optional unique identifier for this instance
  debug = false, // Log events to console during development
}) => {
  // DOM reference for the injection target
  const containerRef = useRef(null);
  
  // Reference to the vanilla JS class instance
  const shareButtonRef = useRef(null);

  // Resolve fallback values when props are not provided (client-side only)
  const currentUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const currentTitle = title || (typeof document !== "undefined" ? document.title : "");

  /**
   * Initialization Effect
   * 
   * Sets up the vanilla JS component once the React component mounts.
   * Includes a safe check for the global SocialShareButton class.
   */
  useEffect(() => {
    const init = () => {
      if (containerRef.current && !shareButtonRef.current) {
        // Ensure the core library is loaded globally (for CDN usage)
        if (typeof window !== "undefined" && window.SocialShareButton) {
          shareButtonRef.current = new window.SocialShareButton({
            container: containerRef.current,
            url: currentUrl,
            title: currentTitle,
            description,
            hashtags,
            via,
            platforms,
            theme,
            buttonText,
            customClass,
            buttonColor,
            buttonHoverColor,
            showButton,
            onShare,
            onCopy,
            buttonStyle,
            modalPosition,
            analytics,
            onAnalytics,
            analyticsPlugins,
            componentId,
            debug,
          });
        }
      }
    };

    init();

    // Cleanup: Destroy the instance when the component unmounts to prevent memory leaks
    return () => {
      if (shareButtonRef.current) {
        shareButtonRef.current.destroy();
        shareButtonRef.current = null;
      }
    };
  }, []); // Run only on mount

  /**
   * Update Effect
   * 
   * Synchronizes React prop changes with the underlying vanilla JS instance 
   * without re-mounting the entire component.
   */
  // Re-run effect when any relevant prop changes to sync with underlying instance
  useEffect(() => {
    if (shareButtonRef.current) {
      // Use the library's built-in update method
      shareButtonRef.current.updateOptions({
        url: currentUrl,
        title: currentTitle,
        description,
        hashtags,
        via,
        platforms,
        theme,
        buttonText,
        customClass,
        buttonColor,
        buttonHoverColor,
        showButton,
        onShare,
        onCopy,
        buttonStyle,
        modalPosition,
        analytics,
        onAnalytics,
        analyticsPlugins,
        componentId,
        debug,
      });
    }
  }, [
    currentUrl,
    currentTitle,
    description,
    hashtags,
    via,
    platforms,
    theme,
    buttonText,
    customClass,
    buttonColor,
    buttonHoverColor,
    showButton,
    onShare,
    onCopy,
    buttonStyle,
    modalPosition,
    analytics,
    onAnalytics,
    analyticsPlugins,
    componentId,
    debug,
  ]);

  // Provide the mount point for the vanilla JS logic
  return <div ref={containerRef}></div>;
};

export default SocialShareButton;
