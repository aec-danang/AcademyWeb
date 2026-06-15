import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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
          return user;
        } else {
          // Create dummy user for test prep phase
          return { id: "test", name: "Test User", email: credentials.email, role: "USER" };
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        // Expose user ID and role to session object
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "USER";
      }
      return token;
    }
  },
  pages: {
    // signIn: '/login', // uncomment when you have a login page
  }
};
