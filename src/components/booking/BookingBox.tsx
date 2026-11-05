"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useSession } from "next-auth/react";
import { ArrowLeft, CalendarDays, Check, ChevronDown, Minus, Plus, Users } from "lucide-react";
import BookingCalendar, { type DayInfo } from "@/components/booking/BookingCalendar";
import { dayKey, formatDay, formatLongDay, formatSlotRange, formatDayKey, type SlotDTO } from "@/lib/slotTime";

const MAX_GUESTS = 10;
const SLOTS_SHOWN = 3;

// ---------- Card shell (Figma "Choose plan": dark panel, accent border) ----------
const Card = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 25px 20px;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  background: ${({ theme }) => theme.colors.panel};
  color: ${({ theme }) => theme.colors.onPanel};
  box-shadow: 4px 4px 2px rgba(0, 0, 0, 0.25);
  /* "Check availability" scrolls here; clear the sticky header (taller on phones). */
  scroll-margin-top: 120px;
  @media (max-width: 760px) { scroll-margin-top: 200px; }
`;
const PriceLead = styled.p`
  margin: 0;
  font-size: 1.375rem;
  font-weight: 900;

  span { font-size: 1rem; font-weight: 400; }
`;
const PriceNote = styled.p`
  margin: 2px 0 0 0;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.panelMuted};
`;
const Fields = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
`;
const FieldBtn = styled.button<{ $side: "left" | "right"; $open: boolean }>`
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px 8px 16px;
  border: 1px solid ${({ $open, theme }) => ($open ? theme.colors.onPanel : theme.colors.panelLine)};
  ${({ $side }) => ($side === "right" ? "border-left-width: 0;" : "")}
  border-radius: ${({ $side }) => ($side === "left" ? "10px 0 0 10px" : "0 10px 10px 0")};
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;

  span { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  span:first-child { font-size: 0.75rem; font-weight: 600; }
  span:last-child { margin-top: 5px; font-size: 0.75rem; font-weight: 300; color: ${({ theme }) => theme.colors.panelMuted}; }
  svg { flex-shrink: 0; transition: transform 0.2s; transform: rotate(${({ $open }) => ($open ? 180 : 0)}deg); }
`;
const GuestsPopover = styled.div`
  position: absolute;
  z-index: 40;
  top: calc(100% + 10px);
  right: 0;
  width: 280px;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
  box-shadow: 0 20px 24px -4px rgba(16, 24, 40, 0.18);

  p { margin: 0; }
`;
const Stepper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  strong { display: block; font-size: 1rem; }
  small { font-size: 0.8125rem; color: ${({ theme }) => theme.colors.textSecondary}; }
`;
const StepBtns = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  output { min-width: 1.5ch; text-align: center; font-weight: 700; }
`;
const RoundBtn = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.textSecondary};
  background: transparent;
  color: inherit;
  cursor: pointer;

  &:disabled { opacity: 0.3; cursor: not-allowed; }
`;
const PopoverFoot = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
`;
const SmallDarkBtn = styled.button`
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  background: ${({ theme }) => theme.colors.textPrimary};
  color: ${({ theme }) => theme.colors.cardBackground};
  font-weight: 700;
  cursor: pointer;
`;
const ListHead = styled.p`
  margin: 0;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.panelMuted};
`;
const LinkBtn = styled.button`
  padding: 0;
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.onPanel};
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
`;
const SlotList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
const SlotRow = styled.li`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.panelLine};
`;
const SlotDate = styled.p`
  margin: 0 0 10px 0;
  font-size: 0.875rem;
`;
const SlotMeta = styled.p`
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.5;

  span { display: block; color: ${({ theme }) => theme.colors.panelMuted}; }
  .low { color: ${({ theme }) => theme.colors.accent}; }
`;
const SlotSide = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  flex-shrink: 0;
`;
const SlotPrice = styled.p`
  margin: 0;
  font-size: 0.875rem;
  white-space: nowrap;
  text-align: right;

  span { font-size: 0.75rem; color: ${({ theme }) => theme.colors.panelMuted}; }
  s { margin-right: 4px; font-size: 0.75rem; color: ${({ theme }) => theme.colors.panelMuted}; }
`;
const AccentBtn = styled.button`
  padding: 8px 20px;
  border-radius: 10px;
  border: none;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.onAccent};
  font-size: 0.875rem;
  font-weight: 900;
  cursor: pointer;

  &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.accentHover}; }
  &:disabled { background: ${({ theme }) => theme.colors.panelLine}; color: ${({ theme }) => theme.colors.onPanel}; cursor: not-allowed; }
`;
const WideAccentBtn = styled(AccentBtn)`
  width: 100%;
  padding: 12px;
  font-size: 1rem;
`;
const WhiteBtn = styled.button`
  width: 100%;
  padding: 8px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.panelLine};
  background: ${({ theme }) => theme.colors.onPanel};
  color: ${({ theme }) => theme.colors.panel};
  font-size: 0.875rem;
  font-weight: 900;
  cursor: pointer;
`;
const Muted = styled.p`
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.4;
  color: ${({ theme }) => theme.colors.panelMuted};
`;
// Checkout
const BackBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  padding: 0;
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.panelMuted};
  font-size: 0.875rem;
  cursor: pointer;

  &:hover { color: ${({ theme }) => theme.colors.onPanel}; }
`;
const StepTitle = styled.h2`
  margin: 0;
  font-size: 1.375rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.onPanel};
`;
const Summary = styled.dl`
  margin: 0;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px 12px;
  font-size: 0.875rem;

  dt { color: ${({ theme }) => theme.colors.panelMuted}; }
  dd { margin: 0; text-align: right; }
`;
const Total = styled.p`
  margin: 0;
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.panelLine};
  font-size: 1.125rem;
  font-weight: 900;
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
const InputLabel = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
`;
const Input = styled.input`
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.panelLine};
  background: transparent;
  color: ${({ theme }) => theme.colors.onPanel};
  font-size: 0.9375rem;

  &:focus { outline: 2px solid ${({ theme }) => theme.colors.accent}; outline-offset: 1px; border-color: transparent; }
  &[aria-invalid="true"] { border-color: #ff8a80; }
`;
const ErrorText = styled.p`
  margin: 0;
  font-size: 0.8125rem;
  color: #ffb4a9;
`;
// Done
const Done = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
`;
const DoneIcon = styled.div`
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.onAccent};
`;
const Reference = styled.p`
  margin: 0;
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px dashed ${({ theme }) => theme.colors.accent};
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: 0.08em;
`;
// Phones: a bar pinned to the bottom of the screen that jumps to the booking box.
const MobileBar = styled.div<{ $hidden: boolean }>`
  display: none;

  @media (max-width: 960px) {
    display: flex;
    position: fixed;
    z-index: 30;
    left: 0;
    right: 0;
    bottom: 0;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 12px clamp(16px, 5vw, 40px) calc(12px + env(safe-area-inset-bottom));
    border-top: 1px solid ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.panel};
    color: ${({ theme }) => theme.colors.onPanel};
    transform: translateY(${({ $hidden }) => ($hidden ? "110%" : "0")});
    transition: transform 0.25s ease;

    p { margin: 0; font-weight: 900; white-space: nowrap; }
    p span { font-weight: 400; font-size: 0.875rem; }
    button { white-space: nowrap; padding: 10px 16px; }
  }
`;

// ---------- Component ----------
interface Props {
  experienceId: string;
  basePrice: number;
  initialSlots: SlotDTO[];
}

type Step = { kind: "choose" } | { kind: "checkout"; slot: SlotDTO } | { kind: "done"; reference: string; slot: SlotDTO; guests: number; total: number; email: string };

const lei = (n: number) => `${Math.round(n)} lei`;

export default function BookingBox({ experienceId, basePrice, initialSlots }: Props) {
  const { data: session } = useSession();
  const [slots, setSlots] = useState(initialSlots);
  const [date, setDate] = useState<string | null>(null);
  const [guests, setGuests] = useState(1);
  const [open, setOpen] = useState<"date" | "guests" | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [step, setStep] = useState<Step>({ kind: "choose" });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);
  const [cardVisible, setCardVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const fieldsRef = useRef<HTMLDivElement>(null);

  // Prefill the checkout with the signed-in account.
  const sessionName = session?.user?.name ?? "";
  const sessionEmail = session?.user?.email ?? "";

  const days = useMemo(() => {
    const map = new Map<string, DayInfo>();
    for (const s of slots) {
      const key = dayKey(s.startsAt);
      const d = map.get(key) ?? { slots: 0, remaining: 0, fromPrice: Infinity };
      d.slots += 1;
      d.remaining += s.remaining;
      d.fromPrice = Math.min(d.fromPrice, s.price);
      map.set(key, d);
    }
    return map;
  }, [slots]);

  const fromPrice = slots.length ? Math.min(...slots.map((s) => s.price)) : basePrice;
  const hasDeals = slots.some((s) => s.price < basePrice);
  const upcoming = slots.filter((s) => s.remaining > 0);
  const listed = date ? slots.filter((s) => dayKey(s.startsAt) === date) : upcoming;
  const visible = showAll || date ? listed : listed.slice(0, SLOTS_SHOWN);
  const firstMonth = slots.length ? dayKey(slots[0].startsAt).slice(0, 7) : dayKey(new Date()).slice(0, 7);
  const lastMonth = slots.length ? dayKey(slots[slots.length - 1].startsAt).slice(0, 7) : firstMonth;

  const refreshSlots = useCallback(async () => {
    try {
      const res = await fetch(`/api/experiences/${experienceId}/slots`, { cache: "no-store" });
      if (res.ok) setSlots(((await res.json()) as { slots: SlotDTO[] }).slots);
    } catch {
      // Keep the list we have; the server re-checks places on booking anyway.
    }
  }, [experienceId]);

  // Close popovers on Escape or a click outside the fields.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    const onDown = (e: MouseEvent) => {
      if (fieldsRef.current && !fieldsRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  // Hide the phone bar while the booking box itself is on screen.
  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setCardVisible(entry.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const choose = (slot: SlotDTO) => {
    setError(null);
    setName((n) => n || sessionName);
    setEmail((m) => m || sessionEmail);
    setStep({ kind: "checkout", slot });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step.kind !== "checkout") return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experienceId, slotId: step.slot.id, guests, name, email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const fields = (data.fields ?? {}) as Record<string, string>;
        setError({ message: data.error ?? "We couldn't complete the booking.", field: Object.keys(fields)[0] });
        if (res.status === 409) refreshSlots();
        return;
      }
      setStep({ kind: "done", reference: data.reference, slot: step.slot, guests: data.guests, total: data.totalPrice, email: data.guestEmail });
      refreshSlots();
    } catch {
      setError({ message: "Network error. Check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const barHidden = cardVisible || step.kind !== "choose";
  const scrollToCard = () => cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  let body: React.ReactNode;
  if (step.kind === "checkout") {
    const { slot } = step;
    const tooMany = guests > slot.remaining;
    body = (
      <>
        <BackBtn type="button" onClick={() => setStep({ kind: "choose" })}>
          <ArrowLeft size={16} aria-hidden /> Change date
        </BackBtn>
        <StepTitle>Confirm and book</StepTitle>
        <Summary>
          <dt>Date</dt>
          <dd>{formatLongDay(slot.startsAt)}</dd>
          <dt>Time</dt>
          <dd>{formatSlotRange(slot.startsAt, slot.endsAt)}</dd>
          <dt>Guests</dt>
          <dd>
            <StepBtns style={{ justifyContent: "flex-end" }}>
              <RoundBtn type="button" onClick={() => setGuests((g) => g - 1)} disabled={guests <= 1} aria-label="One guest fewer"><Minus size={14} /></RoundBtn>
              <output aria-live="polite">{guests}</output>
              <RoundBtn type="button" onClick={() => setGuests((g) => g + 1)} disabled={guests >= Math.min(MAX_GUESTS, slot.remaining)} aria-label="One guest more"><Plus size={14} /></RoundBtn>
            </StepBtns>
          </dd>
          <dt>Price</dt>
          <dd>{lei(slot.price)} × {guests}</dd>
        </Summary>
        <Total><span>Total</span><span>{lei(slot.price * guests)}</span></Total>
        <Form onSubmit={submit} noValidate>
          <InputLabel>
            FULL NAME
            <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required aria-invalid={error?.field === "name"} />
          </InputLabel>
          <InputLabel>
            EMAIL
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required aria-invalid={error?.field === "email"} />
          </InputLabel>
          {tooMany && <ErrorText role="alert">Only {slot.remaining} places are left on this time.</ErrorText>}
          {error && <ErrorText role="alert">{error.message}</ErrorText>}
          <WideAccentBtn type="submit" disabled={submitting || tooMany}>
            {submitting ? "Booking…" : `Book for ${lei(slot.price * guests)}`}
          </WideAccentBtn>
          <Muted>You won&apos;t be charged now. You pay your host on the day, and can cancel under the policy below.</Muted>
        </Form>
      </>
    );
  } else if (step.kind === "done") {
    body = (
      <Done role="status">
        <DoneIcon><Check size={28} strokeWidth={3} aria-hidden /></DoneIcon>
        <StepTitle>You&apos;re booked!</StepTitle>
        <Muted>
          {formatLongDay(step.slot.startsAt)}, {formatSlotRange(step.slot.startsAt, step.slot.endsAt)} · {step.guests}{" "}
          {step.guests === 1 ? "guest" : "guests"} · {lei(step.total)}
        </Muted>
        <Reference aria-label={`Booking reference ${step.reference}`}>{step.reference}</Reference>
        <Muted>Keep this reference and show it to your host when you meet. We&apos;ll use {step.email} if anything changes.</Muted>
        <WhiteBtn type="button" onClick={() => { setStep({ kind: "choose" }); setGuests(1); }}>Book another date</WhiteBtn>
      </Done>
    );
  } else {
    body = (
      <>
        <div>
          <PriceLead>From {lei(fromPrice).replace("lei", "Lei")} / <span>person</span></PriceLead>
          {hasDeals && <PriceNote>Weekday discount: {lei(fromPrice)} instead of {lei(basePrice)}</PriceNote>}
        </div>
        <Fields ref={fieldsRef}>
          <FieldBtn
            type="button"
            $side="left"
            $open={open === "date"}
            aria-expanded={open === "date"}
            aria-controls="booking-calendar"
            onClick={() => setOpen((o) => (o === "date" ? null : "date"))}
          >
            <div style={{ minWidth: 0 }}>
              <span>DATES</span>
              <span>{date ? formatDayKey(date) : "Add dates"}</span>
            </div>
            <ChevronDown size={18} aria-hidden />
          </FieldBtn>
          <FieldBtn
            type="button"
            $side="right"
            $open={open === "guests"}
            aria-expanded={open === "guests"}
            aria-controls="booking-guests"
            onClick={() => setOpen((o) => (o === "guests" ? null : "guests"))}
          >
            <div style={{ minWidth: 0 }}>
              <span>GUESTS</span>
              <span>{guests} {guests === 1 ? "guest" : "guests"}</span>
            </div>
            <ChevronDown size={18} aria-hidden />
          </FieldBtn>
          {open === "date" && (
            <BookingCalendar
              id="booking-calendar"
              days={days}
              selected={date}
              firstMonth={firstMonth}
              lastMonth={lastMonth}
              onSelect={(k) => { setDate(k); if (k) setOpen(null); }}
              onClose={() => setOpen(null)}
            />
          )}
          {open === "guests" && (
            <GuestsPopover id="booking-guests" role="dialog" aria-label="Guests">
              <Stepper>
                <div>
                  <strong><Users size={14} aria-hidden /> Guests</strong>
                  <small>Ages 12 and up, max {MAX_GUESTS}</small>
                </div>
                <StepBtns>
                  <RoundBtn type="button" onClick={() => setGuests((g) => g - 1)} disabled={guests <= 1} aria-label="One guest fewer"><Minus size={14} /></RoundBtn>
                  <output aria-live="polite">{guests}</output>
                  <RoundBtn type="button" onClick={() => setGuests((g) => g + 1)} disabled={guests >= MAX_GUESTS} aria-label="One guest more"><Plus size={14} /></RoundBtn>
                </StepBtns>
              </Stepper>
              <PopoverFoot><SmallDarkBtn type="button" onClick={() => setOpen(null)}>Done</SmallDarkBtn></PopoverFoot>
            </GuestsPopover>
          )}
        </Fields>

        {slots.length === 0 ? (
          <Muted>The host hasn&apos;t published dates yet. Check back soon.</Muted>
        ) : (
          <>
            <ListHead>
              <span>{date ? `${listed.length} ${listed.length === 1 ? "time" : "times"} on ${formatDayKey(date)}` : `Next available · ${upcoming.length} dates`}</span>
              {date && <LinkBtn type="button" onClick={() => setDate(null)}>All dates</LinkBtn>}
            </ListHead>
            <SlotList>
              {visible.map((slot) => {
                const soldOut = slot.remaining === 0;
                const short = !soldOut && guests > slot.remaining;
                return (
                  <SlotRow key={slot.id}>
                    <div>
                      <SlotDate>{formatDay(slot.startsAt)}</SlotDate>
                      <SlotMeta>
                        {formatSlotRange(slot.startsAt, slot.endsAt)}
                        <span className={slot.remaining > 0 && slot.remaining <= 3 ? "low" : undefined}>
                          {soldOut ? "Sold out" : slot.remaining <= 3 ? `Only ${slot.remaining} ${slot.remaining === 1 ? "place" : "places"} left` : `${slot.remaining} places left`}
                        </span>
                      </SlotMeta>
                    </div>
                    <SlotSide>
                      <SlotPrice>
                        {slot.price < basePrice && <s>{lei(basePrice)}</s>}
                        {lei(slot.price)} / <span>person</span>
                      </SlotPrice>
                      <AccentBtn
                        type="button"
                        disabled={soldOut || short}
                        onClick={() => choose(slot)}
                        aria-label={`Choose ${formatDay(slot.startsAt)}, ${formatSlotRange(slot.startsAt, slot.endsAt)}`}
                      >
                        {soldOut ? "Sold out" : short ? "Too few places" : "Choose"}
                      </AccentBtn>
                    </SlotSide>
                  </SlotRow>
                );
              })}
            </SlotList>
            {!date && listed.length > SLOTS_SHOWN && (
              <WhiteBtn type="button" onClick={() => (showAll ? setShowAll(false) : setOpen("date"))}>
                {showAll ? "Show fewer dates" : "Show more dates"}
              </WhiteBtn>
            )}
            {!date && !showAll && listed.length > SLOTS_SHOWN && (
              <LinkBtn type="button" onClick={() => setShowAll(true)} style={{ alignSelf: "center" }}>
                Or list all {listed.length} dates
              </LinkBtn>
            )}
          </>
        )}
      </>
    );
  }

  return (
    <>
      <Card ref={cardRef} id="booking" aria-label="Book this experience">
        {body}
      </Card>
      <MobileBar $hidden={barHidden} aria-hidden={barHidden}>
        <p>From {lei(fromPrice)} <span>/ person</span></p>
        <AccentBtn type="button" onClick={scrollToCard} tabIndex={barHidden ? -1 : 0}>
          <CalendarDays size={14} aria-hidden style={{ verticalAlign: "-2px", marginRight: 6 }} />
          Check availability
        </AccentBtn>
      </MobileBar>
    </>
  );
}
