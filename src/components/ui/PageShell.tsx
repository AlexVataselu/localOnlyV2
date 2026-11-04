"use client";

import type { ReactNode } from "react";
import styled from "styled-components";
import AppFooter from "@/components/AppFooter";
import SiteHeader from "./SiteHeader";

const Main = styled.main`
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem clamp(16px, 5vw, 80px) 0;
`;

const Title = styled.h1`
  margin: 0 0 0.5rem;
  font-family: var(--font-display), sans-serif;
  font-weight: 900;
  font-size: clamp(1.75rem, 3.5vw, 2.5rem);
`;

const Lead = styled.p`
  margin: 0 0 2rem;
  max-width: 60ch;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export default function PageShell({ title, lead, children }: { title: string; lead?: ReactNode; children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <Main id="main">
        <Title>{title}</Title>
        {lead && <Lead>{lead}</Lead>}
        {children}
      </Main>
      <AppFooter />
    </>
  );
}
