-- First, create an enum for user roles
CREATE TYPE public.app_role AS ENUM ('doctor', 'receptionist', 'patient');

-- Create user_roles table to manage role-based access
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  LIMIT 1
$$;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can view all patients" ON public.patients;
DROP POLICY IF EXISTS "Users can view all patient history" ON public.patient_history;

-- Create new restrictive policies for patients table
CREATE POLICY "Medical staff can view all patients" 
ON public.patients 
FOR SELECT 
TO authenticated
USING (
  public.has_role(auth.uid(), 'doctor'::app_role) OR 
  public.has_role(auth.uid(), 'receptionist'::app_role)
);

CREATE POLICY "Patients can view their own records" 
ON public.patients 
FOR SELECT 
TO authenticated
USING (
  public.has_role(auth.uid(), 'patient'::app_role) AND 
  auth.uid() = user_id
);

-- Create new restrictive policies for patient_history table
CREATE POLICY "Medical staff can view all patient history" 
ON public.patient_history 
FOR SELECT 
TO authenticated
USING (
  public.has_role(auth.uid(), 'doctor'::app_role) OR 
  public.has_role(auth.uid(), 'receptionist'::app_role)
);

CREATE POLICY "Patients can view their own history" 
ON public.patient_history 
FOR SELECT 
TO authenticated
USING (
  public.has_role(auth.uid(), 'patient'::app_role) AND 
  EXISTS (
    SELECT 1 FROM public.patients 
    WHERE patients.id = patient_history.patient_id 
    AND patients.user_id = auth.uid()
  )
);

-- Update patient_history INSERT policy to be more restrictive
DROP POLICY IF EXISTS "Users can create patient history" ON public.patient_history;
CREATE POLICY "Medical staff can create patient history" 
ON public.patient_history 
FOR INSERT 
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'doctor'::app_role) OR 
  public.has_role(auth.uid(), 'receptionist'::app_role)
);

-- Create RLS policy for user_roles table
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);