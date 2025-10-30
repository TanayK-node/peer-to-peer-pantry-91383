-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create function to delete old messages and conversations
CREATE OR REPLACE FUNCTION public.delete_old_chats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Delete messages older than 24 hours
  DELETE FROM public.messages
  WHERE created_at < NOW() - INTERVAL '24 hours';
  
  -- Delete conversations that have no messages or are older than 24 hours
  DELETE FROM public.conversations
  WHERE id NOT IN (
    SELECT DISTINCT conversation_id FROM public.messages
  )
  OR created_at < NOW() - INTERVAL '24 hours';
  
  -- Log the cleanup
  RAISE NOTICE 'Deleted old chats older than 24 hours at %', NOW();
END;
$$;

-- Schedule the cleanup job to run every hour
SELECT cron.schedule(
  'delete-old-chats-hourly',
  '0 * * * *', -- Run at the start of every hour
  $$
  SELECT public.delete_old_chats();
  $$
);