-- Create a trigger function to mark conversations as unread when a new message arrives
CREATE OR REPLACE FUNCTION public.mark_conversation_unread()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_conversation RECORD;
BEGIN
  -- Get the conversation details
  SELECT buyer_id, seller_id INTO v_conversation
  FROM public.conversations
  WHERE id = NEW.conversation_id;
  
  -- If sender is the seller, mark as unread for buyer
  IF NEW.sender_id = v_conversation.seller_id THEN
    UPDATE public.conversations
    SET is_unread_buyer = true
    WHERE id = NEW.conversation_id;
  END IF;
  
  -- If sender is the buyer, mark as unread for seller
  IF NEW.sender_id = v_conversation.buyer_id THEN
    UPDATE public.conversations
    SET is_unread_seller = true
    WHERE id = NEW.conversation_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger that fires after a message is inserted
CREATE TRIGGER trigger_mark_conversation_unread
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.mark_conversation_unread();