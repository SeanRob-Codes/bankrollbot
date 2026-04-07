
-- Create a security definer function for cross-user notifications
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
  -- Only allow if the caller is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  INSERT INTO public.notifications (user_id, type, title, message, related_post_id)
  VALUES (_target_user_id, _type, _title, _message, _related_post_id);
END;
$$;
