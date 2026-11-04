"use client";

import styled from "styled-components";
import AppHeader from "@/components/AppHeader";
import {
  HeroSection,
  FeatureCards,
  NewThisWeekSection,
  CTABanner,
  LocalGuidesSection,
  PartnersSection,
} from "@/components/home";
import AppFooter from "@/components/AppFooter";

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

export default function Home() {
  return (
    <PageWrapper>
      <AppHeader showBackLink={false} />
      <main id="main">
        <HeroSection />
        <FeatureCards />
        <NewThisWeekSection />
        <CTABanner />
        <LocalGuidesSection />
        <PartnersSection />
      </main>
      <AppFooter />
    </PageWrapper>
  );
}
