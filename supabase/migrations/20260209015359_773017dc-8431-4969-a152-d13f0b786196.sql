
-- Allow master_admin to view ALL profiles (for admin dashboard)
CREATE POLICY "Master admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'master_admin'::app_role));

-- Allow master_admin to update any profile
CREATE POLICY "Master admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'master_admin'::app_role));
