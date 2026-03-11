
-- Fix: use extensions schema for pgcrypto functions
CREATE OR REPLACE FUNCTION public.hash_password_bcrypt(password text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT extensions.crypt(password, extensions.gen_salt('bf', 10));
$$;

-- Update check_room_password to use extensions schema
CREATE OR REPLACE FUNCTION public.check_room_password(room_id uuid, attempt text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM hosted_rooms
    WHERE id = room_id
      AND is_active = true
      AND password_hash = extensions.crypt(attempt, password_hash)
  );
END;
$$;

-- Update verify_secret_link_password to use extensions schema
CREATE OR REPLACE FUNCTION public.verify_secret_link_password(link_id uuid, attempt text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM secret_links
    WHERE id = link_id
      AND viewed = false
      AND password_protected = true
      AND password_hash = extensions.crypt(attempt, password_hash)
  );
END;
$$;

-- Migrate existing SHA-256 room password to bcrypt
UPDATE hosted_rooms
SET password_hash = extensions.crypt('1234', extensions.gen_salt('bf', 10))
WHERE password_hash = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4';
