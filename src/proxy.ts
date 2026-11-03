import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import type { Database } from "@/types/database.types";

const intlMiddleware = createMiddleware(routing);

// The site is reachable from a few leftover hostnames (the old Vercel
// project URLs from before the custom domain was set up, plus the bare
// "www" variant) — anyone who still has one of these bookmarked/indexed
// gets sent to the one canonical domain (NEXT_PUBLIC_SITE_URL, matches
// what metadataBase/sitemap/robots.txt already treat as canonical)
// instead of serving the same content from multiple hosts. Deliberately
// an explicit allowlist, not "anything that isn't the canonical host" —
// that would also catch Vercel's own per-branch preview deployment URLs
// (*.vercel.app with a build hash) and localhost during development,
// which must keep working unredirected.
const CANONICAL_HOST = "grupofestina.com.br";
const REDIRECT_HOSTS = new Set(["www.grupofestina.com.br", "grupofestina.vercel.app", "people-growth.vercel.app"]);

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase();
  if (host && REDIRECT_HOSTS.has(host)) {
    const url = request.nextUrl.clone();
    url.protocol = "https";
    url.host = CANONICAL_HOST;
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  // The columnist panel used to live at /autor — old bookmarks/links still
  // point there. Handled here (not next.config.ts's redirects()) because
  // this proxy runs before Next's own redirect handling for every request
  // under /autor anyway, so a redirects() entry would never be reached.
  if (request.nextUrl.pathname.startsWith("/autor")) {
    const url = request.nextUrl.clone();
    url.pathname = url.pathname.replace(/^\/autor/, "/colunista");
    return NextResponse.redirect(url, 308);
  }
  if (request.nextUrl.pathname.startsWith("/admin") || request.nextUrl.pathname.startsWith("/colunista")) {
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
  const role = profile?.role as "admin" | "columnist" | undefined;

  // Authenticated but no profile row at all (shouldn't happen in normal
  // operation) — sign out instead of bouncing between routes forever.
  if (!role) {
    await supabase.auth.signOut();
    if (isLoginPage) return response;
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  const home = role === "admin" ? "/admin" : "/colunista";

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
  // `icon` is excluded alongside `api`/`_next`/`_vercel`: it's Next's
  // generated-icon route-handler convention (src/app/icon.ts), served at
  // the extensionless path `/icon` (the hash lives in the query string, so
  // the dotted-path exclusion below doesn't catch it) — without this,
  // next-intl's middleware 307-redirects it to `/pt/icon`, breaking the
  // same-domain favicon <link> tag it's meant to fix.
  matcher: ["/", "/(pt|en)/:path*", "/((?!_next|_vercel|api|icon|.*\\..*).*)"],
};
