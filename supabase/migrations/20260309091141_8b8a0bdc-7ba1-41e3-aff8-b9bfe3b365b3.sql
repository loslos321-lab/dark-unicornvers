
CREATE TABLE public.hosted_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true
);

ALTER TABLE public.hosted_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active rooms" ON public.hosted_rooms
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can create rooms" ON public.hosted_rooms
  FOR INSERT WITH CHECK (true);
