import { NextResponse } from "next/server";

import { auth } from "@/auth";

export default auth((request) => {
  const isAuthenticated = Boolean(request.auth);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/app") && !isAuthenticated) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if ((pathname === "/" || pathname === "/login") && isAuthenticated) {
    return NextResponse.redirect(new URL("/app", request.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/", "/login", "/app/:path*"],
};
