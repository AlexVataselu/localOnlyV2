"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import styled from "styled-components";
import { CalendarCheck, MapPin, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Status";

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: clamp(1.5rem, 4vw, 3rem);
  align-items: center;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const Copy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Lead = styled.p`
  margin: 0;
  max-width: 52ch;
  font-size: 1.15rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Steps = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: grid;
    grid-template-columns: 44px 1fr;
    gap: 0.9rem;
    align-items: start;
  }

  svg {
    width: 44px;
    height: 44px;
    padding: 10px;
    border-radius: 12px;
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.accentText};
  }

  strong {
    display: block;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  span {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const Portrait = styled.div`
  position: relative;
  aspect-ratio: 4 / 5;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.cardHover};

  img {
    object-fit: cover;
    object-position: 50% 20%;
  }

  @media (max-width: 820px) {
    max-width: 420px;
    aspect-ratio: 1;
  }
`;

const Note = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/** What logged-out visitors see on /experiences/new: what hosting is, then sign-in. */
export default function HostLanding() {
  return (
    <Layout>
      <Copy>
        <Lead>
          Know a trail, a recipe or a river better than anyone? Share it. Locals Only connects travellers with the people
          who live where the experience happens.
        </Lead>
        <Steps>
          <li>
            <MapPin aria-hidden />
            <div>
              <strong>Describe your experience</strong>
              <span>Where it happens, how long it takes, what guests will do.</span>
            </div>
          </li>
          <li>
            <Wallet aria-hidden />
            <div>
              <strong>Set your price in lei</strong>
              <span>Per person, decided by you.</span>
            </div>
          </li>
          <li>
            <CalendarCheck aria-hidden />
            <div>
              <strong>Publish and edit any time</strong>
              <span>Your listing shows up on Locals Only straight away.</span>
            </div>
          </li>
        </Steps>
        <div>
          <Button type="button" onClick={() => signIn("google", { callbackUrl: "/experiences/new" })}>
            Sign in with Google to start
          </Button>
        </div>
        <Note>Hosting is invite-only while we&apos;re getting started. Sign in and we&apos;ll show you how to request access.</Note>
      </Copy>
      <Portrait>
        <Image src="/wolf.png" alt="" fill sizes="(max-width: 820px) 420px, 40vw" />
      </Portrait>
    </Layout>
  );
}
