"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styled, { keyframes } from "styled-components";
import { SPLASH_KEY } from "@/lib/splash";

/**
 * First-visit splash: the Locals Only mark on the topo background while the
 * app wakes up, then a quick fade into the page. Shown once per browser
 * session. A tiny inline script in the layout sets html[data-splash="off"]
 * before first paint on later visits, so it never flashes.
 */


const rise = keyframes`
  from { opacity: 0; transform: translateY(12px) scale(0.96); }
  to { opacity: 1; transform: none; }
`;

const grow = keyframes`
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
`;

const Overlay = styled.div<{ $leaving: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  background: #0f1116 url("/topo.jpg") center / cover no-repeat;
  background-blend-mode: soft-light;
  opacity: ${({ $leaving }) => ($leaving ? 0 : 1)};
  transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: ${({ $leaving }) => ($leaving ? "none" : "auto")};

  html[data-splash="off"] & {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    transition-duration: 0.15s;
  }
`;

const Mark = styled.div`
  width: min(380px, 70vw);
  aspect-ratio: 960 / 404;
  position: relative;

  @media (prefers-reduced-motion: no-preference) {
    animation: ${rise} 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
`;

const Tagline = styled.p`
  margin: 0;
  font-family: var(--font-display), sans-serif;
  font-weight: 700;
  font-size: clamp(1rem, 2.4vw, 1.25rem);
  color: rgba(255, 255, 255, 0.85);

  @media (prefers-reduced-motion: no-preference) {
    animation: ${rise} 0.7s 0.15s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
`;

const Bar = styled.div`
  width: 120px;
  height: 3px;
  border-radius: 3px;
  background: #e2a506;
  transform-origin: left;

  @media (prefers-reduced-motion: no-preference) {
    animation: ${grow} 0.9s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
`;

const MIN_VISIBLE_MS = 1100;

export default function Splash() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SPLASH_KEY) === "1";
      window.sessionStorage.setItem(SPLASH_KEY, "1");
    } catch {
      // Storage blocked: show it, it's short.
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const leaveTimer = window.setTimeout(() => setLeaving(true), seen ? 0 : reduce ? 300 : MIN_VISIBLE_MS);
    const goneTimer = window.setTimeout(() => setGone(true), (seen ? 0 : reduce ? 300 : MIN_VISIBLE_MS) + 500);
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(goneTimer);
    };
  }, []);

  if (gone) return null;

  return (
    <Overlay $leaving={leaving} aria-hidden="true">
      <Mark>
        <Image src="/logo-locals-only.png" alt="" fill sizes="380px" priority />
      </Mark>
      <Tagline>Experiences hosted by Romanian locals</Tagline>
      <Bar />
    </Overlay>
  );
}
