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
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 2rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  text-transform: uppercase;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const H2 = styled.h2`
  font-size: 1.15rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  text-transform: uppercase;
`;

const P = styled.p`
  font-size: 0.95rem;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 0.75rem;
`;

const List = styled.ul`
  margin: 0 0 0.75rem;
  padding-left: 1.25rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.95rem;
  line-height: 1.7;
`;

export default function PrivacyPolicyPage() {
  return (
    <PageWrapper>
      <AppHeader title="Privacy Policy" titleAs="p" />
      <Main>
        <Title>Politica de Confidențialitate</Title>

        <Section>
          <P>
            www.localsonly.com reprezintă compania Lala Land. Datele de contact furnizate
            de utilizatori sunt considerate „date cu caracter personal” în sensul Legii nr.
            677/2001. În temeiul Legii nr. 677/2001, beneficiați de: (i) <strong>Dreptul la
            informare</strong> – informații despre operatorul de date, scopul, destinatarii,
            etc.; (ii) <strong>Dreptul de acces la date</strong>; (iii) <strong>Dreptul de
            intervenție</strong> – dreptul de rectificare, actualizare, blocare, ștergere a
            datelor.
          </P>
          <P>
            Respectăm Regulamentul (UE) 679/2016 (GDPR). Site-ul www.eforiecolorat.ro este
            administrat de Asociația Forumul Artelor Vizuale și se angajează la colectare
            și utilizare transparentă a datelor prin formularul de contact.
          </P>
        </Section>

        <Section>
          <H2>Colectarea de informații</H2>
          <P>
            Informațiile sunt colectate la înregistrarea pe site, inclusiv: nume, prenume,
            adresă de email, număr de telefon și întrebări despre nevoile utilizatorului.
          </P>
        </Section>

        <Section>
          <H2>Utilizarea de informații</H2>
          <P>Informațiile colectate sunt folosite pentru:</P>
          <List>
            <li>Personalizarea experienței și răspunsul la nevoile individuale</li>
            <li>Îmbunătățirea site-ului</li>
            <li>Contact prin email sau telefon</li>
          </List>
        </Section>

        <Section>
          <H2>E-Commerce de confidențialitate</H2>
          <P>
            LocalsOnly este singurul proprietar al informațiilor colectate. Informațiile
            de identificare personală nu vor fi vândute, schimbate, transferate sau date
            altor companii fără consimțământul utilizatorului, cu excepția cazurilor
            necesare pentru oferte personalizate. Datele personale vor fi folosite o singură
            dată pentru oferte personalizate. În cazul dezacordului, datele de contact vor
            fi șterse imediat.
          </P>
        </Section>

        <Section>
          <H2>Dezvăluirea părților terțe</H2>
          <P>
            Informațiile de identificare personală nu sunt vândute, tranzacționate sau
            transferate terților. Acest lucru exclude terți de încredere care ne ajută în
            operarea site-ului sau desfășurarea activității, cu condiția păstrării
            confidențialității. Schimbul de informații poate avea loc pentru investigare,
            prevenire sau măsuri împotriva activităților ilegale, fraudă, amenințări la
            siguranța fizică sau încălcări ale termenilor de utilizare.
          </P>
        </Section>

        <Section>
          <H2>Protejarea informațiilor</H2>
          <P>
            Adoptăm măsuri de securitate pentru menținerea în siguranță a informațiilor
            personale. Doar angajații care au nevoie să execute sarcini specifice (ex.:
            facturare, contact pentru oferte personalizate) au acces la datele cu caracter
            personal identificabile. Calculatoarele/serverele pe care se stochează
            informațiile personale sunt păstrate într-un mediu securizat.
          </P>
        </Section>

        <Section>
          <H2>Folosim cookie-uri?</H2>
          <P>
            Da. Folosim cookie-uri pentru a îmbunătăți accesul la site și a identifica
            vizitele repetate. Cookie-urile îmbunătățesc experiența utilizatorului,
            urmărind și direcționând în funcție de interese. Utilizarea cookie-urilor nu
            este legată de informații cu caracter personal identificabile pe site.
          </P>
        </Section>

        <Section>
          <H2>Consimțământul</H2>
          <P>
            Utilizatorii acceptă politica de confidențialitate prin bifarea căsuței
            de sub formularul de contact. În cazul dezacordului cu politica de
            confidențialitate, utilizatorii ne pot contacta prin telefon sau email și pot
            acorda sau refuza ulterior consimțământul privind modul în care datele
            personale pot fi utilizate. Prin bifare, utilizatorul confirmă că a citit și
            a înțeles politica de confidențialitate.
          </P>
        </Section>
      </Main>
      <AppFooter />
    </PageWrapper>
  );
}
