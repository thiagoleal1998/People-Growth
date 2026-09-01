import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pt", "en"],
  defaultLocale: "pt",
  pathnames: {
    "/": "/",
    "/sobre": { pt: "/sobre", en: "/about" },
    "/curriculo": { pt: "/curriculo", en: "/resume" },
    "/portfolio": { pt: "/portfolio", en: "/portfolio" },
    "/portfolio/[slug]": { pt: "/portfolio/[slug]", en: "/portfolio/[slug]" },
    "/servicos": { pt: "/servicos", en: "/services" },
    "/servicos/[slug]": { pt: "/servicos/[slug]", en: "/services/[slug]" },
    "/mea-sententia": { pt: "/mea-sententia", en: "/mea-sententia" },
    "/mea-sententia/[slug]": {
      pt: "/mea-sententia/[slug]",
      en: "/mea-sententia/[slug]",
    },
    "/mea-sententia/autor/[slug]": {
      pt: "/mea-sententia/autor/[slug]",
      en: "/mea-sententia/autor/[slug]",
    },
    "/cursos": { pt: "/cursos", en: "/courses" },
    "/laboratorio-ia": { pt: "/laboratorio-ia", en: "/ai-lab" },
    "/recursos": { pt: "/recursos", en: "/resources" },
    "/na-midia": { pt: "/na-midia", en: "/in-the-media" },
    "/ferramentas": { pt: "/ferramentas", en: "/tools" },
    "/depoimentos": { pt: "/depoimentos", en: "/testimonials" },
    "/contato": { pt: "/contato", en: "/contact" },
  },
});

export type Locale = (typeof routing.locales)[number];
export type Pathnames = keyof typeof routing.pathnames;
