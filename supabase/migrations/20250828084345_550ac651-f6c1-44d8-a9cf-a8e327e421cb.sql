-- Add DELETE policy for patients table
CREATE POLICY "Users can delete patients" 
ON public.patients 
FOR DELETE 
USING (auth.uid() = user_id);