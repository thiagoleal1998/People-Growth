-- Where visits come from, geographically — for the "de onde vem nosso
-- público" breakdown in Relatórios. Filled in from Vercel's automatic
-- IP-geolocation request headers (x-vercel-ip-*), which are present on
-- every request in production with no visitor permission prompt needed,
-- unlike browser geolocation (opt-in, only ever covers a small biased
-- slice of traffic).
ALTER TABLE page_views ADD COLUMN visitor_country TEXT;
ALTER TABLE page_views ADD COLUMN visitor_region TEXT;
ALTER TABLE page_views ADD COLUMN visitor_city TEXT;
