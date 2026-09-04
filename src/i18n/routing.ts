import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pt", "en"],
  defaultLocale: "pt",
  pathnames: {
    "/": "/",
    "/sobre": { pt: "/sobre", en: "/about" },
    "/sobre/[slug]": { pt: "/sobre/[slug]", en: "/about/[slug]" },
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
    "/mea-sententia/colunistas": {
      pt: "/mea-sententia/colunistas",
      en: "/mea-sententia/colunistas",
    },
    "/mea-sententia/categoria/[slug]": {
      pt: "/mea-sententia/categoria/[slug]",
      en: "/mea-sententia/categoria/[slug]",
    },
    "/cursos": { pt: "/cursos", en: "/courses" },
    "/laboratorio-ia": { pt: "/laboratorio-ia", en: "/ai-lab" },
    "/recursos": { pt: "/recursos", en: "/resources" },
    "/na-midia": { pt: "/na-midia", en: "/in-the-media" },
    "/ferramentas": { pt: "/ferramentas", en: "/tools" },
    "/depoimentos": { pt: "/depoimentos", en: "/testimonials" },
    "/contato": { pt: "/contato", en: "/contact" },
    "/cookies": { pt: "/cookies", en: "/cookies" },
    "/direitos-autorais": { pt: "/direitos-autorais", en: "/copyright-notice" },
    "/comentarios": { pt: "/comentarios", en: "/comment-guidelines" },
    "/normas-de-seguranca-e-privacidade": { pt: "/normas-de-seguranca-e-privacidade", en: "/security-privacy-standards" },
    "/termos-de-uso": { pt: "/termos-de-uso", en: "/terms-of-use" },
    "/buscar": { pt: "/buscar", en: "/search" },
  },
});

export type Locale = (typeof routing.locales)[number];
export type Pathnames = keyof typeof routing.pathnames;
