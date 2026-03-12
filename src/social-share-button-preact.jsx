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
}) {
  const containerRef = useRef(null);
  const shareButtonRef = useRef(null);

  const hashtagsDep = JSON.stringify(hashtags);
  const platformsDep = JSON.stringify(platforms);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.SocialShareButton &&
      containerRef.current
    ) {
      shareButtonRef.current = new window.SocialShareButton({
        container: containerRef.current,
        url: url || window.location.href,
        title: title || document.title,
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
    return () => {
      if (shareButtonRef.current) {
        shareButtonRef.current.destroy();
        shareButtonRef.current = null;
      }
    };
  }, []);


  useEffect(() => {
    if (shareButtonRef.current) {
      shareButtonRef.current.updateOptions({
        url,
        title,
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
