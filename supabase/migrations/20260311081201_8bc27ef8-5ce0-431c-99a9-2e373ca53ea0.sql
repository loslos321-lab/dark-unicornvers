
-- Create get_secret_link_meta RPC: returns only metadata for a specific link
CREATE OR REPLACE FUNCTION public.get_secret_link_meta(link_id uuid)
RETURNS TABLE(is_viewed boolean, is_password_protected boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    SELECT viewed, password_protected
    FROM secret_links
    WHERE id = link_id;
END;
$$;

-- Create view_secret_link RPC: atomically marks as viewed and returns encrypted content
CREATE OR REPLACE FUNCTION public.view_secret_link(link_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  content text;
BEGIN
  UPDATE secret_links
  SET viewed = true, viewed_at = now()
  WHERE id = link_id AND viewed = false
  RETURNING encrypted_message INTO content;

  RETURN content;
END;
$$;

-- Drop broad SELECT, UPDATE, DELETE policies on secret_links
DROP POLICY IF EXISTS "Anyone can read secret links" ON public.secret_links;
DROP POLICY IF EXISTS "Anyone can update secret links to mark viewed" ON public.secret_links;
DROP POLICY IF EXISTS "Anyone can delete expired links" ON public.secret_links;

-- Add length constraint trigger for secret_links.encrypted_message
CREATE OR REPLACE FUNCTION public.validate_secret_link_length()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF length(NEW.encrypted_message) > 100000 THEN
    RAISE EXCEPTION 'encrypted_message exceeds maximum length of 100000';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_secret_link_length
  BEFORE INSERT OR UPDATE ON public.secret_links
  FOR EACH ROW EXECUTE FUNCTION public.validate_secret_link_length();

-- Add length constraint trigger for hosted_rooms.name
CREATE OR REPLACE FUNCTION public.validate_room_name_length()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF length(NEW.name) > 64 THEN
    RAISE EXCEPTION 'Room name exceeds maximum length of 64';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_room_name_length
  BEFORE INSERT OR UPDATE ON public.hosted_rooms
  FOR EACH ROW EXECUTE FUNCTION public.validate_room_name_length();
