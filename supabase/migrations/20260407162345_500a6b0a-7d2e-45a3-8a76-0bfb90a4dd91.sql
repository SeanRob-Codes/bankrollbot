
-- Fix notification insert policy
DROP POLICY IF EXISTS "Authenticated can insert notifications" ON public.notifications;

CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Avatar delete policy
CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Public profiles view (safe fields only)
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = on) AS
  SELECT id, username, avatar_url, bet_score, is_premium
  FROM public.profiles;

-- Secure function for cross-user notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  _target_user_id uuid,
  _type text,
  _title text,
  _message text DEFAULT '',
  _related_post_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  INSERT INTO public.notifications (user_id, type, title, message, related_post_id)
  VALUES (_target_user_id, _type, _title, _message, _related_post_id);
END;
$$;
