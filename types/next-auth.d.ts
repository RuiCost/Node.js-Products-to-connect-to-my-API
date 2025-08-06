// next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    username?: string | null;
    token?: string | null;
    id?:number | null;
    // add any other custom fields here
  }

  interface Session {
    accessToken?: string |null;
    user: {
      username?: string | null;
      token?: string | null;
      id: number;
    } & DefaultSession["user"];
  }
}
