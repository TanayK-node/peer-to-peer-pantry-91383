-- Add fulfiller_id to item_requests table
ALTER TABLE item_requests ADD COLUMN fulfiller_id uuid REFERENCES profiles(id);

-- Add index for better performance
CREATE INDEX idx_item_requests_fulfiller_id ON item_requests(fulfiller_id);