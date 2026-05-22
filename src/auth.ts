import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import {
  isAdminEmail,
  verifyAdminCredentials,
  ADMIN_USERNAME,
} from "@/lib/admin-config";

const providers: any[] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

providers.push(
  Credentials({
    id: "credentials",
    name: "Email",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (credentials?.email) {
        return {
          id: "demo-" + Date.now(),
          name: (credentials.email as string).split("@")[0],
          email: credentials.email as string,
          image: null,
        };
      }
      return null;
    },
  })
);

providers.push(
  Credentials({
    id: "admin",
    name: "Admin",
    credentials: {
      username: { label: "Username", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const username = credentials?.username as string | undefined;
      const password = credentials?.password as string | undefined;
      if (verifyAdminCredentials(username, password)) {
        return {
          id: "admin-" + ADMIN_USERNAME,
          name: "Admin",
          email: "admin@rahulfitzz.internal",
          image: null,
        };
      }
      return null;
    },
  })
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  trustHost: true,
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.provider = account?.provider;
      }
      const email = (token.email as string) || (user?.email as string);
      const provider = (token.provider as string) || account?.provider;
      token.isAdmin =
        provider === "admin" || isAdminEmail(email);
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { provider?: string }).provider = token.provider as string;
        (session.user as { isAdmin?: boolean }).isAdmin = Boolean(token.isAdmin);
      }
      return session;
    },
  },
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "rahulfitzz-elite-platform-secret-2026",
});
