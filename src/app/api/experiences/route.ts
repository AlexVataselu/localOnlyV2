import type { NextRequest } from "next/server";
import { relay } from "@/lib/api/proxy";

export const GET = (req: NextRequest) => relay(req, "/experiences");
export const POST = (req: NextRequest) => relay(req, "/experiences", "POST");
