"use client";

import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html {
    overflow-x: hidden;
    width: 100%;
    max-width: 100vw;
    position: relative;
  }

  html {
    position: relative;
  }

  html::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("/topo.jpg");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0.2;
    z-index: 0;
    pointer-events: none;
  }

  body {
    margin: 0;
    min-height: 100%;
    width: 100%;
    max-width: 100vw;
    font-family: var(--font-inter), "Inter", system-ui, sans-serif;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.textPrimary};
    transition: background 0.2s ease, color 0.2s ease;
    z-index: 1;
  }

  a {
    color: inherit;
    text-underline-offset: 3px;
  }

  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focus};
    outline-offset: 2px;
  }

  ::selection {
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.onAccent};
  }

  input, textarea {
    caret-color: ${({ theme }) => theme.colors.accent};
  }

  .visually-hidden {
    position: absolute !important;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Motion is decoration here: keep state changes, drop the movement. */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
    }
    *, *::before, *::after {
      transition-property: opacity, color, background-color, border-color !important;
    }
  }
`;

