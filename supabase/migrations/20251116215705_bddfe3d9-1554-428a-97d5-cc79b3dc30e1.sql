-- Create item_requests table
CREATE TABLE public.item_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  price_quote NUMERIC NOT NULL,
  condition product_condition NOT NULL,
  meetup_preference TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.item_requests ENABLE ROW LEVEL SECURITY;

-- Policies for item_requests
CREATE POLICY "Item requests are viewable by everyone"
  ON public.item_requests
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can create their own item requests"
  ON public.item_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own item requests"
  ON public.item_requests
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own item requests"
  ON public.item_requests
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_item_requests_updated_at
  BEFORE UPDATE ON public.item_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();