import { useEffect, useRef } from "react";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

let scriptInjected = false;

/** Embed oficial de un reel/post de Instagram. Sin API key. */
const InstagramEmbed = ({ url, className = "" }: { url: string; className?: string }) => {
  const ref = useRef<HTMLQuoteElement>(null);

  useEffect(() => {
    const process = () => window.instgrm?.Embeds.process();

    if (window.instgrm) {
      process();
      return;
    }

    if (!scriptInjected) {
      scriptInjected = true;
      const script = document.createElement("script");
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      script.onload = process;
      document.body.appendChild(script);
    }
  }, [url]);

  return (
    <blockquote
      ref={ref}
      className={`instagram-media ${className}`}
      data-instgrm-permalink={url}
      data-instgrm-version="14"
      style={{ margin: 0, minWidth: "unset" }}
    />
  );
};

export default InstagramEmbed;
