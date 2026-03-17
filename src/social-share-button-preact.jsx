import { useEffect, useRef } from "preact/hooks";

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
  analytics = true,
  onAnalytics = null,
  analyticsPlugins = [],
  componentId = null,
  debug = false,
}) {
  const containerRef = useRef(null);
  const shareButtonRef = useRef(null);
  const latestOptionsRef = useRef(null);

  const resolvedUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");
  const resolvedTitle =
    title || (typeof document !== "undefined" ? document.title : "");

  // Keep latest props so delayed init doesn't use stale values.
  latestOptionsRef.current = {
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
  };

  useEffect(() => {
    let checkInterval = null;

    const initButton = () => {
      if (shareButtonRef.current) return;
      if (containerRef.current) {
        shareButtonRef.current = new window.SocialShareButton({
          container: containerRef.current,
          ...latestOptionsRef.current,
        });
      }
    };

    // SSR guard: window is undefined during server render.
    if (typeof window === "undefined") return () => {};

    if (window.SocialShareButton) {
      initButton();
    } else {
      // Poll until the script registers the global, then initialize once.
      checkInterval = setInterval(() => {
        if (window.SocialShareButton) {
          // Stop polling as soon as the library is available.
          clearInterval(checkInterval);
          checkInterval = null;
          initButton();
        }
      }, 100);
    }
    return () => {
      // Cleanup: stop polling and destroy the instance on unmount.
      if (checkInterval) clearInterval(checkInterval);
      if (shareButtonRef.current) {
        shareButtonRef.current.destroy();
        shareButtonRef.current = null;
      }
    };
  }, []);

  const hashtagsDep = JSON.stringify(hashtags);
  const platformsDep = JSON.stringify(platforms);
  const analyticsPluginsDep = JSON.stringify(analyticsPlugins);

  useEffect(() => {
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
        analytics,
        onAnalytics,
        analyticsPlugins,
        componentId,
        debug,
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
    analytics,
    onAnalytics,
    analyticsPlugins,
    componentId,
    debug,
  ]);

  return <div ref={containerRef}></div>;
}
