import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    access_token?: string;
    role?: string;
    expires_in?: string;
    refresh_token?: string;
  }

  interface Session {
    accessToken?: string;
    user: {
      id?: string; // ← ეს უნდა იყოს!
      name?: string | null;
      email?: string | null;
      role?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    access_token?: string;
    id?: string; // ← ეს დაამატე!
    role?: string;
  }
}