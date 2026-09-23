import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: "USER" | "SUB_ADMIN" | "COMMANDER" | "CIRCLE_LEAD" | "ADMIN";
      group: "UNASSIGNED" | "A" | "B";
    };
  }

  interface User {
    role: "USER" | "SUB_ADMIN" | "COMMANDER" | "CIRCLE_LEAD" | "ADMIN";
    group: "UNASSIGNED" | "A" | "B";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "USER" | "SUB_ADMIN" | "COMMANDER" | "CIRCLE_LEAD" | "ADMIN";
    group?: "UNASSIGNED" | "A" | "B";
  }
}
