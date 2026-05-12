import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

// Build providers list dynamically so the app doesn't crash if Google keys are missing
const providers: any[] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// Credentials provider for demo/email login (always available)
providers.push(
  Credentials({
    name: "Demo",
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

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  trustHost: true, // Required for Vercel deployment
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
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).provider = token.provider;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "rahulfitzz-elite-platform-secret-2026",
});

