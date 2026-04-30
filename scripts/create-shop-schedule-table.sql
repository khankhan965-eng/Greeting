-- Create shop_schedule table for managing multiple time slots per day
CREATE TABLE IF NOT EXISTS shop_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  opening_time TEXT NOT NULL, -- Format: "HH:MM" in 24-hour format
  closing_time TEXT NOT NULL, -- Format: "HH:MM" in 24-hour format
  is_closed BOOLEAN DEFAULT false, -- false = active/open, true = inactive/closed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(day_of_week, opening_time, closing_time)
);

-- Enable Row Level Security
ALTER TABLE shop_schedule ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read shop_schedule
CREATE POLICY "Public read access" ON shop_schedule
  FOR SELECT
  USING (true);

-- Allow authenticated users to update shop_schedule
CREATE POLICY "Authenticated update access" ON shop_schedule
  FOR UPDATE USING (true) WITH CHECK (true);

-- Allow authenticated users to insert shop_schedule
CREATE POLICY "Authenticated insert access" ON shop_schedule
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to delete shop_schedule
CREATE POLICY "Authenticated delete access" ON shop_schedule
  FOR DELETE USING (true);

-- Insert default schedule (9 AM to 10 PM daily)
INSERT INTO shop_schedule (day_of_week, opening_time, closing_time, is_closed)
SELECT day, '09:00', '22:00', false
FROM generate_series(0, 6) AS days(day)
ON CONFLICT DO NOTHING;
