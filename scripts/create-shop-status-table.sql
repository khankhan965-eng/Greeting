-- Create shop_status table
CREATE TABLE IF NOT EXISTS shop_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  close_message TEXT NOT NULL DEFAULT 'Sorry, RTC is closed at the moment. We''ll be back soon!',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Only allow one row (id = 'shop')
INSERT INTO shop_status (id, status, close_message) 
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'open', 'Sorry, RTC is closed at the moment. We''ll be back soon!')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE shop_status ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read shop_status
CREATE POLICY "Public read access" ON shop_status
  FOR SELECT
  USING (true);

-- Allow authenticated users to update shop_status
CREATE POLICY "Authenticated update access" ON shop_status
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
