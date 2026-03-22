"use client";

import { useEffect } from "react";

export function LemonSliceAvatar() {
  useEffect(() => {
    // Load Lemon Slice widget script once
    if (document.querySelector('script[src*="lemon-slice-widget"]')) return;

    const script = document.createElement("script");
    script.src = "https://unpkg.com/@lemonsliceai/lemon-slice-widget";
    script.type = "module";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    // @ts-expect-error — custom element not in JSX types
    <lemon-slice-widget agent-id="agent_4275d0f4a14f732b" />
  );
}
