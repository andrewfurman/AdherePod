import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const authRoutes = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password"];
const publicRoutes = ["/", "/api/sign-up", "/api/forgot-password", "/api/reset-password", "/api/cron/send-reminders", "/api/cron/daily-summary", "/api/webhooks/sendgrid"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Allow public routes and API auth routes
  const isPublic =
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/api/auth");

  const isAuthRoute = authRoutes.includes(pathname);

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/my-medications", req.url));
  }

  // Redirect unauthenticated users from protected routes
  if (!isLoggedIn && !isPublic && !isAuthRoute) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.jpg|.*\\.png).*)"],
};
