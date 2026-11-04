import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { anonymous, apiRaw, asUser, type ApiRequest } from "./server";

/**
 * Backend-for-frontend relay used by the /api route handlers. Browser code
 * calls same-origin /api/...; this forwards the request to locals-only-api,
 * acting as the signed-in user when there is one.
 */
export async function relay(req: NextRequest, path: string, method: NonNullable<ApiRequest["method"]> = "GET") {
  const session = await auth();
  const caller = session?.user?.id ? asUser(session.user.id) : anonymous;

  let body: unknown;
  if (method === "POST" || method === "PATCH") {
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: { code: "bad_request", message: "Malformed JSON body" } }, { status: 400 });
    }
  }

  try {
    const res = await apiRaw(path, { method, caller, body, search: req.nextUrl.searchParams });
    if (res.status === 204) return new NextResponse(null, { status: 204 });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("API relay failed", error);
    return NextResponse.json(
      { error: { code: "api_unavailable", message: "We couldn't reach the Locals Only service. Please try again." } },
      { status: 502 },
    );
  }
}
