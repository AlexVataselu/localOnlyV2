import type { DefaultSession } from "next-auth";
import type { Role } from "./experience";

declare module "next-auth" {
  interface Session {
    user: {
      /** locals-only-api User.id */
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    uid?: string;
    role?: Role;
    /** Epoch ms of the last role refresh from the API. */
    roleCheckedAt?: number;
  }
}

export {};
