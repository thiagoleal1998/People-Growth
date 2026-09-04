import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getClientIp, checkRateLimit } from "@/lib/rate-limit";

const ARTICLE_PATH_RE = /^\/(pt\/conteudo|en\/content)\/(?:noticia|mea-sententia)\/(?:categoria|category)\/[^/]+\/([^/]+)\/?$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path, visitorId, referrer, utmSource, utmMedium, utmCampaign } = body as Record<string, unknown>;

    if (typeof path !== "string" || !path || typeof visitorId !== "string" || !visitorId) {
      return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
    }

    const ip = getClientIp(req);
    const { limited } = await checkRateLimit(ip, "track-view", { maxAttempts: 120, windowMinutes: 60 });
    if (limited) {
      return NextResponse.json({ success: true }); // swallow, don't let clients learn the limit
    }

    const supabase = await createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase as any;

    const locale = path.startsWith("/en/") || path === "/en" ? "en" : "pt";
    const articleMatch = path.match(ARTICLE_PATH_RE);

    let articleId: string | null = null;
    if (articleMatch) {
      const slug = articleMatch[2];
      const { data: article } = await client.from("articles").select("id, views").eq("slug", slug).single();
      if (article) {
        articleId = article.id;
        await client.from("articles").update({ views: article.views + 1 }).eq("id", article.id);
      }
    }

    const asStr = (v: unknown) => (typeof v === "string" && v ? v.slice(0, 300) : null);

    // Populated by Vercel's edge network on every production request — no
    // visitor permission needed, unlike browser geolocation.
    const geoHeader = (name: string) => {
      const value = req.headers.get(name);
      return value ? decodeURIComponent(value).slice(0, 200) : null;
    };

    const { data: inserted } = await client
      .from("page_views")
      .insert({
        path: path.slice(0, 500),
        page_type: articleId ? "article" : "page",
        article_id: articleId,
        visitor_id: visitorId.slice(0, 100),
        locale,
        referrer: asStr(referrer),
        utm_source: asStr(utmSource),
        utm_medium: asStr(utmMedium),
        utm_campaign: asStr(utmCampaign),
        visitor_country: geoHeader("x-vercel-ip-country"),
        visitor_region: geoHeader("x-vercel-ip-country-region"),
        visitor_city: geoHeader("x-vercel-ip-city"),
      })
      .select("id")
      .single();

    return NextResponse.json({ success: true, id: inserted?.id ?? null });
  } catch (err) {
    console.error("Track view error:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
