-- Update the delete_old_chats function to delete chats after 5 days instead of 1 day
CREATE OR REPLACE FUNCTION public.delete_old_chats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Delete messages older than 5 days (120 hours)
  DELETE FROM public.messages
  WHERE created_at < NOW() - INTERVAL '5 days';
  
  -- Delete conversations that have no messages or are older than 5 days
  DELETE FROM public.conversations
  WHERE id NOT IN (
    SELECT DISTINCT conversation_id FROM public.messages
  )
  OR created_at < NOW() - INTERVAL '5 days';
  
  -- Log the cleanup
  RAISE NOTICE 'Deleted old chats older than 5 days at %', NOW();
END;
$function$;