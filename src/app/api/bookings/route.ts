import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { BookingError, createBooking, MAX_GUESTS_PER_BOOKING } from "@/lib/bookings";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * POST /api/bookings: { experienceId, slotId, guests, name, email }.
 * Signed-in guests get the booking linked to their account; anyone else books with name and email.
 * No payment is taken: the booking is confirmed and paid to the host on the day.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const experienceId = typeof body.experienceId === "string" ? body.experienceId : "";
  const slotId = typeof body.slotId === "string" ? body.slotId : "";
  const guests = Number(body.guests);
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  const errors: Record<string, string> = {};
  if (!experienceId || !slotId) errors.slot = "Choose a date and time.";
  if (!Number.isInteger(guests) || guests < 1 || guests > MAX_GUESTS_PER_BOOKING) {
    errors.guests = `Choose between 1 and ${MAX_GUESTS_PER_BOOKING} guests.`;
  }
  if (name.length < 2 || name.length > 80) errors.name = "Enter your full name.";
  if (!EMAIL.test(email) || email.length > 120) errors.email = "Enter a valid email address.";
  if (Object.keys(errors).length) {
    return NextResponse.json({ error: Object.values(errors)[0], fields: errors }, { status: 400 });
  }

  const session = await auth().catch(() => null);

  try {
    const booking = await createBooking({
      experienceId,
      slotId,
      guests,
      guestName: name,
      guestEmail: email,
      userId: session?.user?.id ?? null,
    });
    return NextResponse.json(
      {
        reference: booking.reference,
        guests: booking.guests,
        totalPrice: booking.totalPrice,
        startsAt: booking.slot.startsAt.toISOString(),
        endsAt: booking.slot.endsAt.toISOString(),
        guestEmail: booking.guestEmail,
      },
      { status: 201 },
    );
  } catch (e) {
    if (e instanceof BookingError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("Booking failed", e);
    return NextResponse.json({ error: "We couldn't complete the booking. Please try again." }, { status: 500 });
  }
}
