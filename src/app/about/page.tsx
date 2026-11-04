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
      <AppHeader title="About" titleAs="p" />
      <Main>
        <Title>About Locals Only</Title>
        <Lead>
          Locals Only is a small marketplace for experiences in Romania, run by the
          people who live there: guides, cooks, boatmen and instructors who know their
          valley, village or city better than any guidebook.
        </Lead>
        <Text>
          Every listing is hosted by a local. You book directly with them, in small
          groups, and the price you see is the price per person in lei. Hosts write
          their own listings, including what&apos;s included, what to bring and their
          cancellation policy, so you know what you&apos;re signing up for before you
          book.
        </Text>
        <Text>
          We started in the Prahova Valley, around Azuga and Bușteni, and are growing
          slowly into Transylvania and the Danube Delta. If you live somewhere worth
          showing and want to host, you can apply from the &quot;Host an experience&quot;
          page.
        </Text>
        <Text>
          Locals Only is a project organised by the Lala Land association. We want the
          money from tourism to stay with the people and places that make a trip
          memorable.
        </Text>
      </Main>
      <AppFooter />
    </PageWrapper>
  );
}
