-- Add unique_code to profiles table
ALTER TABLE public.profiles
ADD COLUMN unique_code TEXT UNIQUE;

-- Create a function to generate unique 5-digit alphanumeric codes
CREATE OR REPLACE FUNCTION public.generate_unique_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a 5-digit alphanumeric code (uppercase letters and numbers)
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 5));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE unique_code = new_code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Update existing profiles with unique codes
UPDATE public.profiles
SET unique_code = public.generate_unique_code()
WHERE unique_code IS NULL;

-- Make unique_code NOT NULL after populating existing records
ALTER TABLE public.profiles
ALTER COLUMN unique_code SET NOT NULL;

-- Update the handle_new_user function to generate unique codes
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, unique_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.raw_user_meta_data->>'avatar_url',
    public.generate_unique_code()
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Add buyer_id to products table
ALTER TABLE public.products
ADD COLUMN buyer_id UUID REFERENCES public.profiles(id);

-- Create ratings table
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, buyer_id)
);

-- Enable RLS on ratings table
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- RLS policies for ratings
CREATE POLICY "Users can view all ratings"
ON public.ratings
FOR SELECT
USING (true);

CREATE POLICY "Buyers can create ratings for their purchases"
ON public.ratings
FOR INSERT
WITH CHECK (
  auth.uid() = buyer_id AND
  EXISTS (
    SELECT 1 FROM public.products
    WHERE id = product_id
    AND buyer_id = auth.uid()
    AND status = 'sold'
  )
);

-- Create function to update seller rating
CREATE OR REPLACE FUNCTION public.update_seller_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  avg_rating NUMERIC;
  total_count INTEGER;
BEGIN
  -- Calculate average rating and total count for the seller
  SELECT 
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO avg_rating, total_count
  FROM public.ratings
  WHERE seller_id = NEW.seller_id;
  
  -- Update the seller's profile
  UPDATE public.profiles
  SET 
    rating = ROUND(avg_rating, 2),
    total_ratings = total_count
  WHERE id = NEW.seller_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to update seller rating when a new rating is added
CREATE TRIGGER on_rating_created
AFTER INSERT ON public.ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_seller_rating();