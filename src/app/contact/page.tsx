"use client";

import { useState, useCallback } from "react";
import styled from "styled-components";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import { Facebook, Instagram, Linkedin } from "lucide-react";

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const Main = styled.main`
  flex: 1;
  padding: 4rem clamp(24px, 5vw, 80px) 3rem;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
`;

const Grid = styled.div`
  display: grid;

  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const FormSection = styled.section``;

const FormTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1.5rem;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Input = styled.input`
  padding: 0.75rem 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: transparent;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  outline: none;
  transition: border-color 0.2s;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
    opacity: 0.7;
  }

  &:focus {
    border-bottom-color: ${({ theme }) => theme.colors.accent};
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem 0;
  font-size: 1rem;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: transparent;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  outline: none;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
    opacity: 0.7;
  }

  &:focus {
    border-bottom-color: ${({ theme }) => theme.colors.accent};
  }
`;

const SubmitBtn = styled.button`
  align-self: flex-start;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 2rem;
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1.5rem;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const CardText = styled.p`
  font-size: 0.95rem;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 0.75rem;
`;

const CardLink = styled.a`
  display: block;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.accent};
  text-decoration: none;
  margin-bottom: 0.75rem;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

const SocialRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: color 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      // Placeholder: wire to API or email service later
      console.log({ name, email, message });
      setName("");
      setEmail("");
      setMessage("");
    },
    [name, email, message]
  );

  return (
    <PageWrapper>
      <AppHeader title="Contact" />
      <Main>
        <Grid>
          <FormSection>
            <FormTitle>Vrei sa vorbim?</FormTitle>
            <Form onSubmit={handleSubmit}>
              <Label>
                Nume
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nume"
                  required
                />
              </Label>
              <Label>
                Email
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                />
              </Label>
              <Label>
                Mesaj
                <TextArea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Mesaj"
                  required
                />
              </Label>
              <SubmitBtn type="submit">Trimite</SubmitBtn>
            </Form>
          </FormSection>
          <Card>
            <CardTitle>Contact Locals Only</CardTitle>
            <CardLink href="tel:123145789">123.145.789</CardLink>
            <CardLink href="mailto:info@localsonly.com">info@localsonly.com</CardLink>
            <CardText>Locals Only | CA DRE# 00643485</CardText>
            <CardText>© 2023 Locals Only & CO, LLC. All rights reserved.</CardText>
            <CardText>Proiect organizat de asociatia Lala Land.</CardText>
            <SocialRow>
              <SocialLink href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook size={22} />
              </SocialLink>
              <SocialLink href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram size={22} />
              </SocialLink>
              <SocialLink href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin size={22} />
              </SocialLink>
            </SocialRow>
          </Card>
        </Grid>
      </Main>
      <AppFooter />
    </PageWrapper>
  );
}
