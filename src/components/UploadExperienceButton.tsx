"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { Upload, X } from "lucide-react";
import ExperienceForm from "@/components/ExperienceForm";

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.onAccent};
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.cardHover};
    background: ${({ theme }) => theme.colors.accentHover};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.onAccent};
    outline-offset: 2px;
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(0.75rem, 4vw, 1.5rem);
  box-sizing: border-box;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const ModalPanel = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: min(1200px, calc(100vw - 1.5rem));
  max-height: min(94vh, calc(100vh - 2rem));
  margin: auto;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.25);

  @media (min-width: 640px) {
    max-width: min(1200px, calc(100vw - 2rem));
  }
`;

const ModalHeader = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0;

  @media (min-width: 640px) {
    padding: 1.25rem 1.5rem;
  }
`;

const ModalTitle = styled.span`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  justify-self: center;
  grid-column: 2;
`;

const ModalBody = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 1rem 1.25rem;

  @media (min-width: 640px) {
    padding: 1.25rem 1.5rem;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 1rem 1.25rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  gap: 0.75rem;
  flex-shrink: 0;

  @media (min-width: 640px) {
    padding: 1.25rem 1.5rem;
    gap: 1rem;
  }
`;

const FooterCancelBtn = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.cardBackground};
    border-color: ${({ theme }) => theme.colors.textSecondary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FooterSubmitBtn = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: none;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.onAccent};
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.accentHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CloseBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
  grid-column: 1;

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
    background: ${({ theme }) => theme.colors.surface};
  }
`;

export default function UploadExperienceButton() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!session?.user) {
    return null;
  }

  return (
    <>
      <Button
        type="button"
        onClick={openModal}
        aria-label="Upload experience"
        title="Upload experience"
      >
        <Upload size={18} strokeWidth={2} />
      </Button>
      {open &&
        createPortal(
          <Overlay
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-experience-title"
          >
            <ModalPanel onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <CloseBtn type="button" onClick={closeModal} aria-label="Close">
                  <X size={22} />
                </CloseBtn>
                <ModalTitle id="upload-experience-title">Upload an Experience</ModalTitle>
                <span style={{ width: 40, height: 40 }} aria-hidden />
              </ModalHeader>
              <ModalBody>
                <ExperienceForm onClose={closeModal} onPendingChange={setIsPending} />
              </ModalBody>
              <ModalFooter>
                <FooterCancelBtn type="button" onClick={closeModal} disabled={isPending}>
                  Cancel
                </FooterCancelBtn>
                <FooterSubmitBtn
                  type="submit"
                  form="upload-experience-form"
                  disabled={isPending}
                >
                  {isPending ? "Uploading..." : "Upload"}
                </FooterSubmitBtn>
              </ModalFooter>
            </ModalPanel>
          </Overlay>,
          document.body
        )}
    </>
  );
}


