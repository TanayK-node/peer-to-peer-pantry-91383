-- Add unread and important columns to conversations table
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS is_unread_buyer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_unread_seller BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_important_buyer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_important_seller BOOLEAN DEFAULT false;