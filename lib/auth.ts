import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";

import { db } from "@/lib/db";
import { normalizeIdentifier } from "@/lib/identity";

const derivedFallbackSecret = createHash("sha256")
  .update(process.env.DATABASE_URL ?? "emam-reza-group-auth")
  .digest("hex");

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET ?? derivedFallbackSecret,
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
        identifier: { label: "Email or Mobile", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials.password) {
          return null;
        }

        const identifier = normalizeIdentifier(credentials.identifier);

        const user = await db.user.findUnique({
          where: { email: identifier },
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
          user as { role?: "USER" | "SUB_ADMIN" | "COMMANDER" | "CIRCLE_LEAD" | "EVENT_MANAGER" | "ADMIN" }
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
          (token.role as "USER" | "SUB_ADMIN" | "COMMANDER" | "CIRCLE_LEAD" | "EVENT_MANAGER" | "ADMIN") ??
          "USER";
        session.user.group = (token.group as "UNASSIGNED" | "A" | "B") ?? "UNASSIGNED";
      }
      return session;
    },
  },
};
