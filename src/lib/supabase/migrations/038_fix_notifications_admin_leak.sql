-- Bug: "Admins have full access to notifications" was FOR ALL, which
-- includes SELECT — meaning any admin's own notification bell showed
-- EVERYONE's notifications (RLS policies are OR'd together), not just
-- their own. Admins only ever needed to INSERT a notification for someone
-- else (via notifyTicketMember); they never needed to read other people's.
DROP POLICY "Admins have full access to notifications" ON notifications;
CREATE POLICY "Admins can create notifications for anyone" ON notifications FOR INSERT
  WITH CHECK (current_user_role() = 'admin');
