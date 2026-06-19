import { NextAuthOptions } from "next-auth";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";

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
        email: { label: "Email", type: "email", placeholder: "test@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        
        // Find user from database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (user) {
          // You should add proper password checking here using bcrypt
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          } as AuthUser;
        } else {
          // Create dummy user for test prep phase
          return { id: "test", name: "Test User", email: credentials.email, role: "USER" } as AuthUser;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
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
