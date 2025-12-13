import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const DynamicManifest = () => {
  const location = useLocation();

  useEffect(() => {
    let manifest = document.querySelector('link[rel="manifest"]');
    if (!manifest) {
      manifest = document.createElement("link");
      manifest.setAttribute("rel", "manifest");
      document.head.appendChild(manifest);
    }

    // Extract topic from path, assuming path is /topic
    const topic = location.pathname.substring(1);
    const query = topic && topic.length > 0 ? `?topic=${encodeURIComponent(topic)}` : "";

    manifest.setAttribute("href", `/manifest.webmanifest${query}`);
  }, [location]);

  return null;
};

export default DynamicManifest;
