"use client";

import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html {
    overflow-x: clip;
    scroll-behavior: smooth;
    -webkit-text-size-adjust: 100%;
  }

  body {
    margin: 0;
    min-height: 100vh;
    font-family: var(--font-body), system-ui, sans-serif;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.textPrimary};
    line-height: 1.5;
  }

  /* Topographic texture, quieter in light mode so it doesn't muddy text. */
  body::before {
    content: "";
    position: fixed;
    inset: 0;
    background: url("/topo.jpg") center / cover no-repeat;
    opacity: ${({ theme }) => (theme.mode === "dark" ? 0.2 : 0.06)};
    pointer-events: none;
    z-index: -1;
  }

  a {
    color: inherit;
    text-underline-offset: 3px;
  }

  ::selection {
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.onAccent};
  }

  input, textarea {
    caret-color: ${({ theme }) => theme.colors.accent};
  }

  html {
    scrollbar-color: ${({ theme }) => `${theme.colors.border} ${theme.colors.background}`};
  }

  img {
    max-width: 100%;
  }

  button, input, select, textarea {
    font: inherit;
  }

  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focus};
    outline-offset: 2px;
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

  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
  }
`;
