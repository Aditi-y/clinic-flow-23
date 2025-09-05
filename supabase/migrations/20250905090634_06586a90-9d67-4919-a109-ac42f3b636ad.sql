-- Fix RLS policies for patients table to allow authenticated users to insert/update without user_id restriction
-- First drop existing policies
DROP POLICY IF EXISTS "Users can view all patients" ON public.patients;
DROP POLICY IF EXISTS "Users can insert patients" ON public.patients;
DROP POLICY IF EXISTS "Users can update patients" ON public.patients;
DROP POLICY IF EXISTS "Users can delete patients" ON public.patients;

-- Create new policies that work for all authenticated users
CREATE POLICY "Authenticated users can view all patients" 
ON public.patients 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert patients" 
ON public.patients 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update patients" 
ON public.patients 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete patients" 
ON public.patients 
FOR DELETE 
TO authenticated
USING (true);

-- Fix patient_history policies too
DROP POLICY IF EXISTS "Users can view all patient history" ON public.patient_history;
DROP POLICY IF EXISTS "Users can create patient history" ON public.patient_history;

CREATE POLICY "Authenticated users can view patient history" 
ON public.patient_history 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create patient history" 
ON public.patient_history 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Fix prescriptions policies
DROP POLICY IF EXISTS "Users can view all prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Doctors can create prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Doctors can update their prescriptions" ON public.prescriptions;

CREATE POLICY "Authenticated users can view prescriptions" 
ON public.prescriptions 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create prescriptions" 
ON public.prescriptions 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update prescriptions" 
ON public.prescriptions 
FOR UPDATE 
TO authenticated
USING (true);