import type { NextRequest } from "next/server";
import { relay } from "@/lib/api/proxy";

type Context = { params: Promise<{ id: string }> };

const path = async ({ params }: Context) => `/experiences/${encodeURIComponent((await params).id)}`;

export const GET = async (req: NextRequest, ctx: Context) => relay(req, await path(ctx));
export const PATCH = async (req: NextRequest, ctx: Context) => relay(req, await path(ctx), "PATCH");
export const DELETE = async (req: NextRequest, ctx: Context) => relay(req, await path(ctx), "DELETE");
