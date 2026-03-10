
CREATE TABLE public.secret_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  encrypted_message text NOT NULL,
  password_protected boolean NOT NULL DEFAULT false,
  password_hash text,
  viewed boolean NOT NULL DEFAULT false,
  viewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone
);

ALTER TABLE public.secret_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create secret links"
ON public.secret_links FOR INSERT TO public
WITH CHECK (true);

CREATE POLICY "Anyone can read secret links"
ON public.secret_links FOR SELECT TO public
USING (true);

CREATE POLICY "Anyone can update secret links to mark viewed"
ON public.secret_links FOR UPDATE TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can delete expired links"
ON public.secret_links FOR DELETE TO public
USING (true);
