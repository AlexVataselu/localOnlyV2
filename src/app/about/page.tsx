"use client";

import styled from "styled-components";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Main = styled.main`
  flex: 1;
  padding: 4rem clamp(24px, 5vw, 80px) 3rem;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1.5rem;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Lead = styled.p`
  font-size: 1.2rem;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 1.5rem;
`;

const Text = styled.p`
  font-size: 1rem;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

export default function AboutPage() {
  return (
    <PageWrapper>
      <AppHeader title="About" />
      <Main>
        <Title>About Locals Only</Title>
        <Lead>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
          nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </Lead>
        <Text>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore
          eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt
          in culpa qui officia deserunt mollit anim id est laborum.
        </Text>
        <Text>
          Locals Only connects you with unique experiences and authentic hosts. Discover
          adventures off the beaten path, from mountain trails to local crafts, and
          create memories that last a lifetime.
        </Text>
        <Text>
          Proiect organizat de asociatia Lala Land. We are committed to supporting local
          communities and sustainable tourism.
        </Text>
      </Main>
      <AppFooter />
    </PageWrapper>
  );
}
