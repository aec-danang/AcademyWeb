import { NextAuthOptions } from "next-auth";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

type AuthUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
};

type AuthToken = {
  id?: string;
  role?: string;
};

export const authOptions: NextAuthOptions = {
  providers: [
    // Placeholder credentials provider for testing, replace with real logic or OAuth later
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email / Username", type: "text", placeholder: "Email or Username" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;
        
        // Find user from database
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.identifier },
              { username: credentials.identifier }
            ]
          }
        });
        
        if (user && user.password) {
          const isValidPassword = await bcrypt.compare(credentials.password, user.password);
          if (!isValidPassword) {
            return null;
          }
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          } as AuthUser;
        } else {
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  callbacks: {
    async session({ session, token }) {
      const authToken = token as AuthToken;

      if (token && session.user) {
        // Expose user ID and role to session object
        (session.user as { id?: string; role?: string }).id = authToken.id;
        (session.user as { id?: string; role?: string }).role = authToken.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      const authToken = token as AuthToken;

      if (user) {
        authToken.id = user.id;
        authToken.role = (user as { role?: string }).role || "USER";
      }
      return token;
    }
  },
  pages: {
    // signIn: '/login', // uncomment when you have a login page
  }
};
