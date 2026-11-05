import { randomInt } from "crypto";
import prisma from "@/lib/prisma";
import type { SlotDTO } from "@/lib/slotTime";

/** How far ahead the booking calendar shows slots. */
export const BOOKING_WINDOW_DAYS = 120;
/** Most guests one booking can hold. */
export const MAX_GUESTS_PER_BOOKING = 10;

/** Upcoming slots for an experience with the places still free. Past and cancelled-out slots are left out. */
export async function getUpcomingSlots(experienceId: string, basePrice: number): Promise<SlotDTO[]> {
  const now = new Date();
  const until = new Date(now.getTime() + BOOKING_WINDOW_DAYS * 86_400_000);
  const slots = await prisma.timeSlot.findMany({
    where: { experienceId, startsAt: { gt: now, lte: until } },
    orderBy: { startsAt: "asc" },
    include: { bookings: { where: { status: "CONFIRMED" }, select: { guests: true } } },
  });
  return slots.map((s) => {
    const taken = s.bookings.reduce((sum, b) => sum + b.guests, 0);
    return {
      id: s.id,
      startsAt: s.startsAt.toISOString(),
      endsAt: s.endsAt.toISOString(),
      capacity: s.capacity,
      remaining: Math.max(0, s.capacity - taken),
      price: s.price ?? basePrice,
    };
  });
}

// No 0/O or 1/I, so a reference read over the phone can't be misheard.
const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const newBookingReference = () =>
  "LO-" + Array.from({ length: 6 }, () => REF_ALPHABET[randomInt(REF_ALPHABET.length)]).join("");

export class BookingError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export interface NewBooking {
  experienceId: string;
  slotId: string;
  guests: number;
  guestName: string;
  guestEmail: string;
  userId?: string | null;
}

/**
 * Books places on a slot. The slot row is locked for the transaction, so two
 * guests booking the last places at the same moment can't both get them.
 */
export async function createBooking(input: NewBooking) {
  return prisma.$transaction(async (tx) => {
    const locked = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "TimeSlot" WHERE "id" = ${input.slotId} AND "experienceId" = ${input.experienceId} FOR UPDATE`;
    if (locked.length === 0) throw new BookingError("That time slot doesn't exist.", 404);

    const slot = await tx.timeSlot.findUniqueOrThrow({
      where: { id: input.slotId },
      include: {
        experience: { select: { price: true, title: true } },
        bookings: { where: { status: "CONFIRMED" }, select: { guests: true } },
      },
    });
    if (slot.startsAt <= new Date()) throw new BookingError("That time slot has already started.", 409);

    const remaining = slot.capacity - slot.bookings.reduce((sum, b) => sum + b.guests, 0);
    if (remaining <= 0) throw new BookingError("Sorry, that time slot just sold out.", 409);
    if (input.guests > remaining) {
      throw new BookingError(`Only ${remaining} ${remaining === 1 ? "place is" : "places are"} left on that time slot.`, 409);
    }

    const unitPrice = slot.price ?? slot.experience.price;
    return tx.booking.create({
      data: {
        reference: newBookingReference(),
        slotId: slot.id,
        experienceId: input.experienceId,
        userId: input.userId ?? null,
        guestName: input.guestName,
        guestEmail: input.guestEmail,
        guests: input.guests,
        unitPrice,
        totalPrice: unitPrice * input.guests,
      },
      include: { slot: { select: { startsAt: true, endsAt: true } } },
    });
  });
}
