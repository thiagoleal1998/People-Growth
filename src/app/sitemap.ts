import { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://peopleandgrowth.com.br";

const routes = [
  { path: "/", priority: 1.0 },
  { path: "/sobre", priority: 0.9 },
  { path: "/curriculo", priority: 0.8 },
  { path: "/portfolio", priority: 0.8 },
  { path: "/servicos", priority: 0.9 },
  { path: "/mea-sententia", priority: 0.9 },
  { path: "/cursos", priority: 0.7 },
  { path: "/laboratorio-ia", priority: 0.8 },
  { path: "/recursos", priority: 0.8 },
  { path: "/na-midia", priority: 0.6 },
  { path: "/ferramentas", priority: 0.6 },
  { path: "/depoimentos", priority: 0.7 },
  { path: "/contato", priority: 0.8 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["pt", "en"];

  return routes.flatMap(({ path, priority }) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority,
    }))
  );
}
