import AppFooter from "@/components/AppFooter";
import {
  BadgesSection,
  CTABanner,
  FeatureCards,
  HeroSection,
  LocalGuidesSection,
  NewestExperiencesSection,
  PartnersSection,
} from "@/components/home";
import SiteHeader from "@/components/ui/SiteHeader";

export default function Home() {
  return (
    <>
      <SiteHeader overlay />
      <main id="main">
        <HeroSection />
        <FeatureCards />
        <NewestExperiencesSection />
        <CTABanner />
        <LocalGuidesSection />
        <BadgesSection />
        <PartnersSection />
      </main>
      <AppFooter />
    </>
  );
}
