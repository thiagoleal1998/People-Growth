import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import type { Database } from "@/types/database.types";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin") || request.nextUrl.pathname.startsWith("/autor")) {
    return handlePanelAuth(request);
  }
  return intlMiddleware(request);
}

async function handlePanelAuth(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === "/admin/login";

  if (!user) {
    if (isLoginPage) return response;
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = profile?.role as "admin" | "author" | undefined;

  // Authenticated but no profile row at all (shouldn't happen in normal
  // operation) — sign out instead of bouncing between routes forever.
  if (!role) {
    await supabase.auth.signOut();
    if (isLoginPage) return response;
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  const home = role === "admin" ? "/admin" : "/autor";

  if (isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = home;
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = home;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/", "/(pt|en)/:path*", "/((?!_next|_vercel|api|.*\\..*).*)"],
};
