-- Enable RLS on all tables
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE rare_parts ENABLE ROW LEVEL SECURITY;

-- 1. Bookings Policies
-- Allow anyone to insert a booking (public lead generation)
CREATE POLICY "Allow public insert bookings" ON bookings
    FOR INSERT WITH CHECK (true);

-- Allow admins to manage all bookings
CREATE POLICY "Allow admins to manage bookings" ON bookings
    FOR ALL USING (auth.role() = 'authenticated');


-- 2. Offer Leads Policies
-- Allow anyone to insert a lead
CREATE POLICY "Allow public insert leads" ON offer_leads
    FOR INSERT WITH CHECK (true);

-- Allow admins to manage all leads
CREATE POLICY "Allow admins to manage leads" ON offer_leads
    FOR ALL USING (auth.role() = 'authenticated');


-- 3. Rare Parts Policies
-- Allow public to view available parts
CREATE POLICY "Allow public select parts" ON rare_parts
    FOR SELECT USING (true);

-- Allow admins to manage parts
CREATE POLICY "Allow admins to manage parts" ON rare_parts
    FOR ALL USING (auth.role() = 'authenticated');
