/** Browser-side helpers for the same-origin /api relay. */

export class ClientApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details: Array<{ path: string; message: string }> = [],
  ) {
    super(message);
  }

  /** Field-level messages keyed by field name, for forms. */
  fieldErrors(): Record<string, string> {
    return Object.fromEntries(this.details.map((d) => [d.path.split(".")[0], d.message]));
  }
}

const FRIENDLY: Record<number, string> = {
  401: "Please sign in to continue.",
  403: "You don't have permission to do that.",
  404: "We couldn't find that.",
};

export async function request<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method: init.method ?? "GET",
      headers: init.body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new ClientApiError(0, "You seem to be offline. Check your connection and try again.");
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error = data?.error;
    const message =
      error?.code === "validation_error"
        ? "Some fields need attention."
        : FRIENDLY[res.status] ?? error?.message ?? "Something went wrong. Please try again.";
    throw new ClientApiError(res.status, message, error?.details ?? []);
  }
  return data as T;
}
