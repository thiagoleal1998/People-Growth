-- Lets an admin manually place a columnist in the org chart (OrganogramaCard)
-- instead of it being entirely inferred from is_founder/role_pt text. Used
-- two ways: org_chart_role is the short title shown in that person's box
-- (falls back to the existing CEO/CMO/CCAO text-sniffing in role_pt/role_en
-- when empty, so existing founders keep working unchanged); org_chart_manager_id
-- makes them show up as a report under that manager's box, opening a new
-- tier below C-Level for people who aren't founders themselves (e.g. a
-- Social Media Manager reporting to the CMO).
alter table columnists add column org_chart_role text;
alter table columnists add column org_chart_manager_id uuid references columnists(id) on delete set null;
