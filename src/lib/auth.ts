import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { api, service } from "@/lib/api/server";
import type { Role } from "@/types/experience";

/**
 * Google sign-in with JWT sessions. There is no database here: on sign-in the
 * user is synced to locals-only-api, which owns the user record and role.
 * The role in the session is refreshed from the API every few minutes, so a
 * promotion to HOST shows up without signing out. (The API never trusts the
 * session's role anyway; it re-checks on every write.)
 */

const ROLE_REFRESH_MS = 5 * 60 * 1000;

type ApiUser = { id: string; email: string; name: string | null; image: string | null; role: Role };

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  // Build OAuth callback URLs from the incoming request's host, so every
  // Vercel deployment (preview or production) calls back to itself.
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user?.email) {
        const synced = await api<ApiUser>("/users/sync", {
          method: "POST",
          caller: service,
          body: { email: user.email, name: user.name ?? null, image: user.image ?? null },
        });
        token.uid = synced.id;
        token.role = synced.role;
        token.roleCheckedAt = Date.now();
        return token;
      }

      if (token.uid && Date.now() - (token.roleCheckedAt ?? 0) > ROLE_REFRESH_MS) {
        try {
          const fresh = await api<ApiUser>(`/users/${encodeURIComponent(token.uid)}`, { caller: service });
          token.role = fresh.role;
          token.name = fresh.name ?? token.name;
        } catch {
          // API unreachable: keep the previous role; the API enforces it anyway.
        }
        token.roleCheckedAt = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid ?? "";
        session.user.role = token.role ?? "CLIENT";
      }
      return session;
    },
  },
});

/** The signed-in user's API id, or null. */
export async function currentUser() {
  const session = await auth();
  return session?.user?.id ? session.user : null;
}
