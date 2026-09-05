-- Lets an admin/author leave a short note explaining why a comment was
-- rejected — visible only in the moderation views (admin/author comments
-- pages), never on the public site.
ALTER TABLE comments ADD COLUMN rejection_reason TEXT;

-- Extends the column-level grant from 021_security_hardening.sql (which
-- limited authenticated users to updating only `status`) to also allow
-- `rejection_reason`, keeping every other column still read-only via UPDATE.
REVOKE UPDATE ON comments FROM authenticated;
GRANT UPDATE (status, rejection_reason) ON comments TO authenticated;
