/**
 * Adds demo time slots, bookings and reviews to the experiences already in the
 * database. Additive and safe to re-run (unlike `yarn db:seed`, which wipes everything).
 * Run: yarn db:seed-bookings
 */
import { PrismaClient } from "@prisma/client";
import { seedBookingData } from "./bookingSeed";

const prisma = new PrismaClient();

seedBookingData(prisma)
  .then((r) => console.log(`Booking demo data: ${r.experiences} experiences, +${r.slots} slots, +${r.bookings} bookings, +${r.reviews} reviews`))
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
