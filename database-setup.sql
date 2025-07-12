-- WearShare Database Setup
-- Run this in your Supabase SQL Editor

-- Create tables
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  points INTEGER DEFAULT 100,
  isAdmin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  type TEXT,
  size TEXT,
  condition TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'swapped', 'redeemed')),
  images TEXT[],
  uploader_id UUID REFERENCES users(id) ON DELETE CASCADE,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS swaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  redeemer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  points_used INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_uploader_id ON items(uploader_id);
CREATE INDEX IF NOT EXISTS idx_items_approved ON items(approved);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_swaps_item_id ON swaps(item_id);
CREATE INDEX IF NOT EXISTS idx_swaps_requester_id ON swaps(requester_id);
CREATE INDEX IF NOT EXISTS idx_swaps_owner_id ON swaps(owner_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_item_id ON redemptions(item_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_redeemer_id ON redemptions(redeemer_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE swaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('item-images', 'item-images', true),
  ('user-avatars', 'user-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.isAdmin = true
    )
  );

CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.isAdmin = true
    )
  );

-- Create RLS policies for items table
CREATE POLICY "Anyone can view approved items" ON items
  FOR SELECT USING (approved = true);

CREATE POLICY "Users can view own items" ON items
  FOR SELECT USING (auth.uid() = uploader_id);

CREATE POLICY "Users can create items" ON items
  FOR INSERT WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "Users can update own items" ON items
  FOR UPDATE USING (auth.uid() = uploader_id);

CREATE POLICY "Users can delete own items" ON items
  FOR DELETE USING (auth.uid() = uploader_id);

CREATE POLICY "Admins can do everything on items" ON items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.isAdmin = true
    )
  );

-- Create RLS policies for swaps table
CREATE POLICY "Users can view swaps they're involved in" ON swaps
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = owner_id);

CREATE POLICY "Users can create swap requests" ON swaps
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update swaps they own" ON swaps
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Admins can view all swaps" ON swaps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.isAdmin = true
    )
  );

-- Create RLS policies for redemptions table
CREATE POLICY "Users can view own redemptions" ON redemptions
  FOR SELECT USING (auth.uid() = redeemer_id);

CREATE POLICY "Users can create redemptions" ON redemptions
  FOR INSERT WITH CHECK (auth.uid() = redeemer_id);

CREATE POLICY "Admins can view all redemptions" ON redemptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.isAdmin = true
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create storage policies
CREATE POLICY "Anyone can view item images" ON storage.objects
  FOR SELECT USING (bucket_id = 'item-images');

CREATE POLICY "Authenticated users can upload item images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'item-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own item images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'item-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own item images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'item-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view user avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-avatars' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'user-avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Insert a default admin user (optional - you can create this manually)
-- Replace 'your-admin-email@example.com' with your actual email
-- INSERT INTO users (id, name, email, isAdmin) 
-- VALUES (
--   (SELECT id FROM auth.users WHERE email = 'your-admin-email@example.com'),
--   'Admin User',
--   'your-admin-email@example.com',
--   true
-- ); 