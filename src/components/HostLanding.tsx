"use client";

import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import styled from "styled-components";
import { CalendarCheck, MapPin, Wallet } from "lucide-react";

/**
 * Shown on /experiences/new instead of a bare redirect:
 * - signed out: what hosting is, then Google sign-in
 * - signed in but not a host yet: how hosting is enabled
 */

const Wrap = styled.main`
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: clamp(1.5rem, 4vw, 3rem);
  align-items: center;
  max-width: 1100px;
  margin: 0 auto;
  padding: clamp(2rem, 5vw, 4rem) clamp(16px, 5vw, 80px);

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const Copy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  h1 {
    margin: 0;
    font-size: clamp(2rem, 4vw, 2.75rem);
    line-height: 1.1;
  }
`;

const Lead = styled.p`
  margin: 0;
  max-width: 52ch;
  font-size: 1.15rem;
  line-height: 1.6;
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

const Primary = styled.button`
  align-self: flex-start;
  min-height: 48px;
  padding: 0 1.5rem;
  border: none;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.onAccent};
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.accentHover};
  }
`;

const Note = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  a {
    color: ${({ theme }) => theme.colors.accentText};
    font-weight: 600;
  }
`;

const Portrait = styled.div`
  position: relative;
  aspect-ratio: 4 / 5;
  border-radius: 20px;
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

export default function HostLanding({ signedIn, email }: { signedIn: boolean; email?: string | null }) {
  return (
    <Wrap id="main">
      <Copy>
        <h1>Host an experience</h1>
        <Lead>
          Know a trail, a recipe or a river better than anyone? Share it with travellers who want to see it the way the
          people who live there do.
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
        {signedIn ? (
          <Note>
            Your account{email ? ` (${email})` : ""} isn&apos;t a host account yet. Hosting is turned on by the Locals
            Only team; <Link href="/contact">get in touch</Link> and tell us what you&apos;d like to host.
          </Note>
        ) : (
          <>
            <Primary type="button" onClick={() => signIn("google", { callbackUrl: "/experiences/new" })}>
              Sign in with Google to start
            </Primary>
            <Note>You&apos;ll come straight back here after signing in.</Note>
          </>
        )}
      </Copy>
      <Portrait>
        <Image src="/wolf.png" alt="" fill sizes="(max-width: 820px) 420px, 40vw" />
      </Portrait>
    </Wrap>
  );
}
