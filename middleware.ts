import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { canAccessAdminPanel, isEventsOnlyAdmin } from "@/lib/admin-permissions";

function isAllowedEventsOnlyPath(pathname: string) {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/events") ||
    pathname.startsWith("/api/admin/events")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminApi = pathname.startsWith("/api/admin");
  const token = await getToken({ req: request });
  const role = token?.role as string | undefined;

  if (!token || !canAccessAdminPanel(role)) {
    if (isAdminApi) {
      return NextResponse.json({ message: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isEventsOnlyAdmin(role) && !isAllowedEventsOnlyPath(pathname)) {
    if (isAdminApi) {
      return NextResponse.json({ message: "دسترسی فقط به مدیریت رویدادها مجاز است" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/admin/events", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
