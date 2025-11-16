-- Add item_request_id to conversations table and make product_id nullable
ALTER TABLE conversations 
  ADD COLUMN item_request_id UUID REFERENCES item_requests(id) ON DELETE CASCADE;

-- Make product_id nullable since conversations can be about either products or item requests
ALTER TABLE conversations 
  ALTER COLUMN product_id DROP NOT NULL;

-- Add check constraint to ensure either product_id or item_request_id is set
ALTER TABLE conversations
  ADD CONSTRAINT conversations_product_or_request_check 
  CHECK (
    (product_id IS NOT NULL AND item_request_id IS NULL) OR 
    (product_id IS NULL AND item_request_id IS NOT NULL)
  );

-- Update RLS policies to handle item request conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
CREATE POLICY "Users can view their own conversations" 
ON conversations 
FOR SELECT 
USING ((auth.uid() = buyer_id) OR (auth.uid() = seller_id));

DROP POLICY IF EXISTS "Buyers can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" 
ON conversations 
FOR INSERT 
WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);