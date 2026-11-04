import "server-only";
import { SignJWT } from "jose";

/**
 * Server-side client for locals-only-api.
 *
 * The browser never holds API credentials. Server code (route handlers,
 * server components, NextAuth callbacks) calls the API with a short-lived
 * HS256 token signed with API_JWT_SECRET:
 *   - asUser(id): act on behalf of the signed-in person
 *   - service:    web-app housekeeping (user sync, role refresh)
 * The API re-reads roles from its database, so the token carries no role.
 */

const TOKEN_TTL_SECONDS = 300;

function config() {
  const baseUrl = process.env.API_URL;
  const secret = process.env.API_JWT_SECRET;
  if (!baseUrl) throw new Error("API_URL is not set (e.g. http://localhost:4000)");
  if (!secret || secret.length < 32) throw new Error("API_JWT_SECRET must be set to the same 32+ character value as the API");
  return { baseUrl: baseUrl.replace(/\/$/, ""), key: new TextEncoder().encode(secret) };
}

export type Caller = { kind: "anonymous" } | { kind: "user"; id: string } | { kind: "service" };

export const anonymous: Caller = { kind: "anonymous" };
export const service: Caller = { kind: "service" };
export const asUser = (id: string): Caller => ({ kind: "user", id });

async function tokenFor(caller: Caller, key: Uint8Array): Promise<string | null> {
  if (caller.kind === "anonymous") return null;
  const jwt = new SignJWT({ scope: caller.kind })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("locals-only-web")
    .setAudience("locals-only-api")
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL_SECONDS}s`);
  if (caller.kind === "user") jwt.setSubject(caller.id);
  return jwt.sign(key);
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: Array<{ path: string; message: string }>,
  ) {
    super(message);
  }
}

export interface ApiRequest {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  caller?: Caller;
  body?: unknown;
  search?: URLSearchParams | string;
}

/** Low-level call: returns the raw Response so route handlers can relay it. */
export async function apiRaw(path: string, { method = "GET", caller = anonymous, body, search }: ApiRequest = {}) {
  const { baseUrl, key } = config();
  const token = await tokenFor(caller, key);
  const query = search ? `?${search.toString()}` : "";
  return fetch(`${baseUrl}${path}${query}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
}

/** Typed call that throws ApiError for non-2xx responses. */
export async function api<T>(path: string, request: ApiRequest = {}): Promise<T> {
  const res = await apiRaw(path, request);
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error = data?.error ?? {};
    throw new ApiError(res.status, error.code ?? "api_error", error.message ?? `API request failed (${res.status})`, error.details);
  }
  return data as T;
}
