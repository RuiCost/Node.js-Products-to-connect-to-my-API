
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch("http://localhost:8080/api/account/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: credentials?.username,
            password: credentials?.password,
          }),
        });

        // Since your token is in Authorization header, get it from headers here:
        const token = res.headers.get("Authorization");

        if (!res.ok || !token) {
          return null;
        }

        // You said the body has account info (no token), so parse body too:
        const accountInfo = await res.json();

        // Return user object that NextAuth will store in the session
        return {
          ...accountInfo,
          token,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
    if (user) {
      token.accessToken = user.token;
      token.username = user.username;  // add username to token
      token.id = user.id;
    }
    return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      session.user.username = token.username as string | undefined; // add username to session.user
      session.user.id = token.id as number;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
  },
};

