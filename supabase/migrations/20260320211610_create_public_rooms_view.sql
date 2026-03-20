
-- Create public_rooms view to expose only non-sensitive room data
CREATE OR REPLACE VIEW public.public_rooms AS
SELECT id, name, created_by, created_at, is_active
FROM public.hosted_rooms
WHERE is_active = true;

-- Grant SELECT permission on the view
GRANT SELECT ON public.public_rooms TO public;
