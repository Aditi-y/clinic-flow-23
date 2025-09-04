-- Revert to original database structure by dropping the role-based changes
-- This removes the app_role enum, user_roles table, and related functions

-- Drop the functions first
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
DROP FUNCTION IF EXISTS public.get_current_user_role();

-- Drop the user_roles table if it exists
DROP TABLE IF EXISTS public.user_roles;

-- Drop the enum type if it exists
DROP TYPE IF EXISTS public.app_role;

-- Restore original RLS policies for patients table
DROP POLICY IF EXISTS "Medical staff can view all patients" ON public.patients;
DROP POLICY IF EXISTS "Patients can view their own records" ON public.patients;

-- Restore simple policies for patients
CREATE POLICY "Users can view all patients" 
ON public.patients 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert patients" 
ON public.patients 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update patients" 
ON public.patients 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete patients" 
ON public.patients 
FOR DELETE 
USING (true);

-- Restore original RLS policies for patient_history table
DROP POLICY IF EXISTS "Medical staff can view all patient history" ON public.patient_history;
DROP POLICY IF EXISTS "Medical staff can create patient history" ON public.patient_history;
DROP POLICY IF EXISTS "Patients can view their own history" ON public.patient_history;

-- Restore simple policies for patient_history
CREATE POLICY "Users can view all patient history" 
ON public.patient_history 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create patient history" 
ON public.patient_history 
FOR INSERT 
WITH CHECK (true);