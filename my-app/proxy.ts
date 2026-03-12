export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/equipment/:path*",
    "/borrow/:path*",
    "/calendar/:path*",
  ],
};

