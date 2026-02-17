"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

/**
 * Fires scroll_depth_25 once when user scrolls 25% of the document height.
 */
export function HeroScrollDepth() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;

    const onScroll = () => {
      if (fired.current) return;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const pct = (window.scrollY / scrollHeight) * 100;
      if (pct >= 25) {
        fired.current = true;
        track("scroll_depth_25");
        window.removeEventListener("scroll", onScroll, { passive: true });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
