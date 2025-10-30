-- Add RLS policies to allow users to update and delete their own conversations
CREATE POLICY "Users can update their own conversations"
ON public.conversations
FOR UPDATE
USING ((auth.uid() = buyer_id) OR (auth.uid() = seller_id));

CREATE POLICY "Users can delete their own conversations"
ON public.conversations
FOR DELETE
USING ((auth.uid() = buyer_id) OR (auth.uid() = seller_id));