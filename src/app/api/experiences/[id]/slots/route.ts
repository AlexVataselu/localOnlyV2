import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUpcomingSlots } from "@/lib/bookings";

/** GET /api/experiences/:id/slots: upcoming bookable slots with the places left. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const experience = await prisma.experience.findUnique({ where: { id }, select: { price: true } });
  if (!experience) {
    return NextResponse.json({ error: "Experience not found" }, { status: 404 });
  }
  const slots = await getUpcomingSlots(id, experience.price);
  return NextResponse.json({ slots }, { headers: { "Cache-Control": "no-store" } });
}
