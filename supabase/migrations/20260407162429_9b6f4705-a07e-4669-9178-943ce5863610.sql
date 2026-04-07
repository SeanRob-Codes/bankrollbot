
-- Prevent users from self-updating sensitive fields
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow service_role to modify these fields
  IF current_setting('request.jwt.claims', true)::jsonb->>'role' != 'service_role' THEN
    NEW.is_premium := OLD.is_premium;
    NEW.stripe_customer_id := OLD.stripe_customer_id;
    NEW.bet_score := OLD.bet_score;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_sensitive_profile_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_fields();

-- Tighten notification insert: drop user-facing policy, only allow via create_notification RPC
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;

CREATE POLICY "Service role can insert notifications"
  ON public.notifications FOR INSERT TO service_role
  WITH CHECK (true);
