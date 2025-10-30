-- Add "Other Items" category
INSERT INTO public.categories (name, slug, icon) 
VALUES ('Other Items', 'other-items', '🔧')
ON CONFLICT (slug) DO NOTHING;