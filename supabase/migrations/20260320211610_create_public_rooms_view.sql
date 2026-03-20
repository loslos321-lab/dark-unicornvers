
-- Create public_rooms view to expose only non-sensitive room data
-- SECURITY INVOKER ensures RLS policies on the underlying table are respected
CREATE OR REPLACE VIEW public.public_rooms
WITH (SECURITY_INVOKER = ON)
AS
SELECT id, name, created_by, created_at, is_active
FROM public.hosted_rooms
WHERE is_active = true;

-- Grant SELECT permission on the view
GRANT SELECT ON public.public_rooms TO anon, authenticated, public;
