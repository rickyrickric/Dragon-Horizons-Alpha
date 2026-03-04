-- Safe test policy for `applications` table
-- Use this to temporarily allow narrow, controlled inserts from the anon role
-- Run in Supabase SQL Editor. Remove when finished testing.

-- Remove any previous test policy of the same name
DROP POLICY IF EXISTS allow_test_inserts_on_applications ON public.applications;

-- Create a restrictive insert policy for testing only.
-- Conditions:
--  - aternos_username must start with 'autotest_'
--  - reason must contain 'automated test' (case-insensitive)
--  - aternos_username length is limited to protect against abuse
CREATE POLICY allow_test_inserts_on_applications
  ON public.applications
  FOR INSERT
  TO anon
  WITH CHECK (
    aternos_username LIKE 'autotest_%'
    AND lower(reason) LIKE '%automated test%'
    AND char_length(aternos_username) < 64
  );

-- Grant insert to anon role if needed (policy is usually sufficient)
GRANT INSERT ON public.applications TO anon;

-- Example test INSERT that conforms to the policy:
-- INSERT INTO public.applications (nickname, discord, aternos_username, reason, status)
-- VALUES ('AutoTestUser','Auto#0001','autotest_local_1','Automated test insertion','pending');

-- Clean-up (run after testing):
-- DROP POLICY IF EXISTS allow_test_inserts_on_applications ON public.applications;
-- REVOKE INSERT ON public.applications FROM anon;