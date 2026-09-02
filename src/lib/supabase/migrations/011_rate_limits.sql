-- Tracks public form submissions (contact, newsletter, ...) per IP so
-- /api/* routes can throttle floods. Only ever touched via the service
-- role from server code, so RLS is enabled with zero policies (default
-- deny for anon/authenticated).
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX rate_limits_ip_endpoint_idx ON rate_limits (ip, endpoint, created_at);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
