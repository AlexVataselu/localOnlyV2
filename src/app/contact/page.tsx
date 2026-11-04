"use client";

import { useState, useCallback } from "react";
import styled from "styled-components";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";

const CONTACT_EMAIL = "info@localsonly.com";

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
    color: ${({ theme }) => theme.colors.accentText};
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
  color: ${({ theme }) => theme.colors.accentText};
  text-decoration: none;
  margin-bottom: 0.75rem;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // There is no message backend yet: the form opens the visitor's email app with the
  // message filled in, so nothing typed here is silently lost.
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const subject = encodeURIComponent(`Message from ${name}`);
      const body = encodeURIComponent(`${message}\n\n${name} <${email}>`);
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    },
    [name, email, message]
  );

  return (
    <PageWrapper>
      <AppHeader title="Contact" titleAs="p" />
      <Main>
        <Grid>
          <FormSection>
            <FormTitle>Want to talk?</FormTitle>
            <Form onSubmit={handleSubmit}>
              <Label>
                Name
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </Label>
              <Label>
                Email
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </Label>
              <Label>
                Message
                <TextArea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about a listing, hosting, or anything else"
                  required
                />
              </Label>
              <SubmitBtn type="submit">Write email</SubmitBtn>
            </Form>
          </FormSection>
          <Card>
            <CardTitle>Contact Locals Only</CardTitle>
            <CardLink href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</CardLink>
            <CardText>
              Hosts, guests and partners: write to us and a person from the team will reply.
              Questions about a specific booking are best sent to its host.
            </CardText>
            <CardText>A project organised by the Lala Land association.</CardText>
          </Card>
        </Grid>
      </Main>
      <AppFooter />
    </PageWrapper>
  );
}
