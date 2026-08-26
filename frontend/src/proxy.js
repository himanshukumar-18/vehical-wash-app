import { NextResponse } from "next/server";

const publicPaths = ["/login", "/register", "/verify-otp"];

export function proxy(request) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("access_token")?.value;
    const role = request.cookies.get("role")?.value;

    // Allow only login/register/OTP without token
    if (publicPaths.includes(pathname)) {
        return NextResponse.next();
    }

    // Protect all other pages, including home page "/"
    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Protect admin pages
    if (pathname.startsWith("/admin") && role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Run proxy on application pages only.
         * Ignore Next internal files, API calls, and static assets.
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};