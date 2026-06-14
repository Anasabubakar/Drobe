import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/auth"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => request.cookies.get(name)?.value,
        set: (name: string, value: string, opts: Record<string, unknown>) => {
          request.cookies.set({ name, value, ...opts });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...opts });
        },
        remove: (name: string, opts: Record<string, unknown>) => {
          request.cookies.set({ name, value: "", ...opts });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...opts });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const isPublic =
    PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/onboarding");

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // Redirect logged-in users away from landing/auth
  if (user && (pathname === "/" || pathname === "/auth")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
