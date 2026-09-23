import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          group: user.group,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const role = (
          user as { role?: "USER" | "SUB_ADMIN" | "COMMANDER" | "CIRCLE_LEAD" | "ADMIN" }
        ).role;
        const group = (user as { group?: "UNASSIGNED" | "A" | "B" }).group;

        if (role) token.role = role;
        if (group) token.group = group;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role =
          (token.role as "USER" | "SUB_ADMIN" | "COMMANDER" | "CIRCLE_LEAD" | "ADMIN") ??
          "USER";
        session.user.group = (token.group as "UNASSIGNED" | "A" | "B") ?? "UNASSIGNED";
      }
      return session;
    },
  },
};
