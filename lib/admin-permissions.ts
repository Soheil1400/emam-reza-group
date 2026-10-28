export type AppRole =
  | "USER"
  | "SUB_ADMIN"
  | "COMMANDER"
  | "CIRCLE_LEAD"
  | "EVENT_MANAGER"
  | "ADMIN";

export const ADMIN_PANEL_ROLES: AppRole[] = [
  "ADMIN",
  "SUB_ADMIN",
  "COMMANDER",
  "CIRCLE_LEAD",
  "EVENT_MANAGER",
];

export function canAccessAdminPanel(role: string | undefined | null): role is AppRole {
  return ADMIN_PANEL_ROLES.includes(role as AppRole);
}

export function isEventsOnlyAdmin(role: string | undefined | null) {
  return role === "EVENT_MANAGER";
}

export function canAccessEventsManagement(role: string | undefined | null) {
  return (
    role === "ADMIN" ||
    role === "SUB_ADMIN" ||
    role === "COMMANDER" ||
    role === "CIRCLE_LEAD" ||
    role === "EVENT_MANAGER"
  );
}
