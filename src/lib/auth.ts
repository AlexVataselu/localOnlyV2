import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import type { Adapter } from "next-auth/adapters";
import type { JWT } from "next-auth/jwt";
import Google from "next-auth/providers/google";
import prisma from "@/lib/prisma";

function requireEnv(value: string | undefined, key: string) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  secret: requireEnv(authSecret, "AUTH_SECRET or NEXTAUTH_SECRET"),
  // Build OAuth callback URLs from the request host, so every Vercel deployment calls back to itself.
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: requireEnv(process.env.GOOGLE_CLIENT_ID, "GOOGLE_CLIENT_ID"),
      clientSecret: requireEnv(process.env.GOOGLE_CLIENT_SECRET, "GOOGLE_CLIENT_SECRET"),
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      const tokenWithRole = token as TokenWithRole;

      if (user) {
        tokenWithRole.role = (user as { role?: UserRole }).role ?? tokenWithRole.role ?? "CLIENT";
        tokenWithRole.name = user.name ?? tokenWithRole.name;
      }

      if (!tokenWithRole.role && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, name: true },
        });

        if (dbUser) {
          tokenWithRole.role = dbUser.role;
          tokenWithRole.name = dbUser.name ?? tokenWithRole.name;
        }
      }

      return tokenWithRole;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        const tokenWithRole = token as TokenWithRole;
        session.user.id = token.sub ?? session.user.id ?? "";
        session.user.role = tokenWithRole.role ?? "CLIENT";
        session.user.name = tokenWithRole.name ?? session.user.name;
      }
      return session;
    },
  },
});

export async function getHostSession() {
  const session = await auth();

  if (!session?.user || session.user.role !== "HOST") {
    return null;
  }

  return session;
}

type UserRole = "CLIENT" | "HOST";
type TokenWithRole = JWT & { role?: UserRole; name?: string | null };

