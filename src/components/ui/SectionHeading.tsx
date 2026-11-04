"use client";

import type { ReactNode } from "react";
import styled from "styled-components";

const Row = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const TitleWrap = styled.div`
  min-width: 0;
`;

const Title = styled.h2`
  display: inline-block;
  margin: 0;
  padding: 0 0 0.4rem 0.75rem;
  border-left: 5px solid ${({ theme }) => theme.colors.accent};
  border-bottom: 5px solid ${({ theme }) => theme.colors.accent};
  border-bottom-left-radius: 6px;
  font-family: var(--font-display), sans-serif;
  font-size: clamp(1.4rem, 2.6vw, 1.9rem);
  font-weight: 900;
  line-height: 1.15;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Lead = styled.p`
  margin: 0.75rem 0 0;
  max-width: 60ch;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
`;

interface SectionHeadingProps {
  id?: string;
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
}

export default function SectionHeading({ id, title, lead, actions }: SectionHeadingProps) {
  return (
    <Row>
      <TitleWrap>
        <Title id={id}>{title}</Title>
        {lead && <Lead>{lead}</Lead>}
      </TitleWrap>
      {actions && <Actions>{actions}</Actions>}
    </Row>
  );
}

export const Section = styled.section`
  width: 100%;
  padding: clamp(2rem, 5vw, 3.5rem) clamp(16px, 5vw, 80px);
`;
