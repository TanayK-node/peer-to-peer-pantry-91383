-- Add item_request_id column to ratings table (nullable to support both product and item request ratings)
ALTER TABLE public.ratings 
ALTER COLUMN product_id DROP NOT NULL;

ALTER TABLE public.ratings 
ADD COLUMN item_request_id uuid REFERENCES public.item_requests(id) ON DELETE CASCADE;

-- Create index for item_request_id
CREATE INDEX idx_ratings_item_request_id ON public.ratings(item_request_id);

-- Add check constraint to ensure either product_id or item_request_id is set (but not both)
ALTER TABLE public.ratings 
ADD CONSTRAINT ratings_product_or_item_request_check 
CHECK (
  (product_id IS NOT NULL AND item_request_id IS NULL) OR 
  (product_id IS NULL AND item_request_id IS NOT NULL)
);

-- Update RLS policy for item request ratings
DROP POLICY IF EXISTS "Buyers can create ratings for their purchases" ON public.ratings;

CREATE POLICY "Users can create ratings for purchases and fulfilled requests" 
ON public.ratings 
FOR INSERT 
WITH CHECK (
  auth.uid() = buyer_id AND (
    -- For product ratings
    (product_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = ratings.product_id 
      AND products.buyer_id = auth.uid() 
      AND products.status = 'sold'::product_status
    ))
    OR
    -- For item request ratings (requester rates the fulfiller)
    (item_request_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM item_requests 
      WHERE item_requests.id = ratings.item_request_id 
      AND item_requests.user_id = auth.uid() 
      AND item_requests.status = 'fulfilled'
    ))
  )
);