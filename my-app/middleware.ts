export { auth as proxy } from "@/lib/auth";

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/projects/:path*",
    "/equipment/:path*",
    "/borrow/:path*",
    "/calendar/:path*",
  ],
};

