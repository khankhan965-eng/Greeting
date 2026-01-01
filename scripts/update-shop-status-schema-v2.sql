-- Adding columns for daily schedule and offers persistence
ALTER TABLE shop_status 
ADD COLUMN IF NOT EXISTS enable_auto_schedule BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS opening_time TEXT DEFAULT '09:00 AM',
ADD COLUMN IF NOT EXISTS closing_time TEXT DEFAULT '10:00 PM',
ADD COLUMN IF NOT EXISTS offers JSONB DEFAULT '[]'::jsonb;
