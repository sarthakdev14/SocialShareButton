import { useEffect, useRef } from "preact/hooks";

/**
 * A Preact wrapper around the vanilla SocialShareButton library.
 * Initializes the widget on mount, syncs prop changes via updateOptions,
 * and destroys the instance on unmount.
 *
 * @param {string} url - URL to share (defaults to current page)
 * @param {string} title - Share title (defaults to document.title)
 * @param {string} description - Share description
 * @param {string[]} hashtags - Hashtags for supported platforms
 * @param {string} via - Twitter via handle
 * @param {string[]} platforms - Platforms to display
 * @param {string} theme - 'dark' | 'light'
 * @param {string} buttonText - Label on the share button
 * @param {string} customClass - Extra CSS class on the container
 * @param {Function|null} onShare - Callback fired on share
 * @param {Function|null} onCopy - Callback fired on link copy
 * @param {string} buttonStyle - Button style variant
 * @param {string} modalPosition - 'center' | 'top' | 'bottom'
 */
export default function SocialShareButton({
  url = "",
  title = "",
  description = "",
  hashtags = [],
  via = "",
  platforms = [
    "whatsapp",
    "facebook",
    "twitter",
    "linkedin",
    "telegram",
    "reddit",
  ],
  theme = "dark",
  buttonText = "Share",
  customClass = "",
  onShare = null,
  onCopy = null,
  buttonStyle = "default",
  modalPosition = "center",
}) {
  const containerRef = useRef(null);
  const shareButtonRef = useRef(null);

  useEffect(() => {
    let checkInterval = null;

    const resolvedUrl =
      url || (typeof window !== "undefined" ? window.location.href : "");
    const resolvedTitle =
      title || (typeof document !== "undefined" ? document.title : "");

    const initButton = () => {
      if (shareButtonRef.current) return;
      if (containerRef.current) {
        shareButtonRef.current = new window.SocialShareButton({
          container: containerRef.current,
          url: resolvedUrl,
          title: resolvedTitle,
          description,
          hashtags,
          via,
          platforms,
          theme,
          buttonText,
          customClass,
          onShare,
          onCopy,
          buttonStyle,
          modalPosition,
        });
      }
    };

    if (typeof window === "undefined") return () => {};

    if (window.SocialShareButton) {
      initButton();
    } else {
      checkInterval = setInterval(() => {
        if (window.SocialShareButton) {
          clearInterval(checkInterval);
          checkInterval = null;
          initButton();
        }
      }, 100);
    }
    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (shareButtonRef.current) {
        shareButtonRef.current.destroy();
        shareButtonRef.current = null;
      }
    };
  }, []);

  const hashtagsDep = JSON.stringify(hashtags);
  const platformsDep = JSON.stringify(platforms);

  useEffect(() => {
    const resolvedUrl =
      url || (typeof window !== "undefined" ? window.location.href : "");
    const resolvedTitle =
      title || (typeof document !== "undefined" ? document.title : "");

    if (shareButtonRef.current) {
      shareButtonRef.current.updateOptions({
        url: resolvedUrl,
        title: resolvedTitle,
        description,
        hashtags,
        via,
        platforms,
        theme,
        buttonText,
        customClass,
        onShare,
        onCopy,
        buttonStyle,
        modalPosition,
      });
    }
  }, [
    url,
    title,
    description,
    hashtagsDep,
    via,
    platformsDep,
    theme,
    buttonText,
    customClass,
    onShare,
    onCopy,
    buttonStyle,
    modalPosition,
  ]);

  return <div ref={containerRef}></div>;
}
