-- Mercado Livre's public search API started returning 403 for everyone
-- (confirmed live, not credentials-related) shortly after the "promos"
-- feature shipped. Adding eBay's Browse API as a second, currently-working
-- source — its catalog is USD, so promos need to track their own currency
-- instead of always assuming BRL. promo_search_rules also needs to say
-- which marketplace each rule targets.
ALTER TABLE promos ADD COLUMN currency TEXT NOT NULL DEFAULT 'BRL';

ALTER TABLE promos DROP CONSTRAINT promos_source_check;
ALTER TABLE promos ADD CONSTRAINT promos_source_check CHECK (source IN ('manual', 'mercado_livre', 'ebay'));

ALTER TABLE promo_search_rules ADD COLUMN marketplace TEXT NOT NULL DEFAULT 'mercado_livre' CHECK (marketplace IN ('mercado_livre', 'ebay'));
