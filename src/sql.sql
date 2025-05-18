-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint to auth.users
ALTER TABLE users
ADD CONSTRAINT fk_auth_users FOREIGN KEY (id) REFERENCES auth.users(id);

-- Create hotels table
CREATE TABLE hotels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  hotel_id UUID REFERENCES hotels(id),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_price NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Alter bookings table to reference rooms instead of hotels
ALTER TABLE bookings
  DROP COLUMN hotel_id,
  ADD COLUMN room_id UUID REFERENCES rooms(id) ON DELETE SET NULL;

-- Add payment_status column to bookings table
ALTER TABLE bookings
ADD COLUMN payment_status TEXT DEFAULT 'pending';

-- Add status validation
ALTER TABLE bookings
ADD CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));

ALTER TABLE bookings
ADD CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed'));


-- Create reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  hotel_id UUID REFERENCES hotels(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Create rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  room_type TEXT NOT NULL, -- e.g., Standard, Deluxe, Suite
  price_per_night NUMERIC NOT NULL,
  max_occupancy INTEGER NOT NULL, -- e.g., 2 for double, 4 for family
  description TEXT,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (email) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Insert data into hotels table
INSERT INTO hotels (name, location, price_per_night, description, image_url)
VALUES
  ('Hotel Paradise', 'Cairo', 150.00, 'Luxury hotel with Nile view', 'https://assets.hrewards.com/assets/hyscai71_shr_el_tahrir_cairo_exterior_ram_8132fcrop1_16a8d9288c.jpg'),
  ('Sea Breeze Resort', 'Alexandria', 100.00, 'Beachfront resort', 'https://q-xx.bstatic.com/xdata/images/hotel/max500/59758725.jpg?k=51b7ff091850781bcff6b83e79cc0398c1fba590857bf6dd550dd54d7b368336&o='),
  ('Sunrise Oasis', 'Sharm El Sheikh', 180.00, 'All-inclusive resort with coral reef access', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/29/3e/81/fb/sunrise-oasis-hotel.jpg?w=900&h=500&s=1'),
  ('Mountain Retreat', 'Aswan', 120.00, 'Quiet stay near the Nubian mountains', 'https://cdn.jwplayer.com/v2/media/Wy1c2opK/poster.jpg?width=1280'),
  ('Blue Lagoon Hotel', 'Hurghada', 110.00, 'Family-friendly hotel with water park', 'https://cf.bstatic.com/xdata/images/hotel/max500/451987879.jpg?k=6e63f7b277bcdace08471e0c03f094631c7447364bc344193189e3710c6c0d86&o='),
  ('Urban Stay', 'Cairo', 90.00, 'Modern hotel in the heart of downtown Cairo', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/459514924.jpg?k=e2fdaef5ba79d826c47239984f8cbe0e0bcd841e218c2d5c0ec40f198baebf50&o=&hp=1'),
  ('The Pyramids Inn', 'Giza', 130.00, 'View of the Great Pyramids from every room', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3P4CZMq1QI32uiym028Z8hl7bcxK42ymkEw&s'),
  ('Palm Garden Resort', 'Marsa Alam', 140.00, 'Secluded resort with private beach', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/634226852.jpg?k=761ed548637c81ec8a92d639ae744e71cfa3120ed8d4a5f4a1c53038286b279f&o=&hp=1'),
  ('Lighthouse Hotel', 'Port Said', 95.00, 'Coastal escape with lighthouse views', 'https://static.wixstatic.com/media/fb30c2_2421a41b09e04a8699acb6315a0236cc~mv2.jpeg/v1/fill/w_560,h_372,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Brightly%20Lit%20Lighthouse.jpeg'),
  ('Luxor Royal Hotel', 'Luxor', 125.00, 'Steps from the Karnak Temple', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/469002076.jpg?k=fa2d59d5f833a84016cf07b13e66e29ff0cb6eef3f26f4a1c53038286b279f&o=&hp=1'),
  ('Nile Garden Inn', 'Minya', 70.00, 'Budget hotel with garden and Nile view', 'https://imgcy.trivago.com/c_fill,d_dummy.jpeg,e_sharpen:60,f_auto,h_267,q_40,w_400/hotelier-images/76/cb/d5774212aed209d83466283b2f4dee58c1c24144b37a02bb26e03b52fe53.jpeg')



-- Insert sample data into rooms table
INSERT INTO rooms (hotel_id, room_type, price_per_night, max_occupancy, description, image_url, is_available)
VALUES
  ((SELECT id FROM hotels WHERE name = 'Hotel Paradise'), 'Standard Room', 150.00, 2, 'Cozy room with city view', 'https://example.com/images/standard_room.jpg', TRUE),
  ((SELECT id FROM hotels WHERE name = 'Hotel Paradise'), 'Deluxe Suite', 250.00, 4, 'Spacious suite with Nile view', 'https://example.com/images/deluxe_suite.jpg', TRUE),
  ((SELECT id FROM hotels WHERE name = 'Sea Breeze Resort'), 'Beachfront Room', 120.00, 2, 'Room with direct beach access', 'https://example.com/images/beachfront_room.jpg', TRUE),
  ((SELECT id FROM hotels WHERE name = 'Sea Breeze Resort'), 'Family Suite', 200.00, 4, 'Suite with kids’ area', 'https://example.com/images/family_suite.jpg', TRUE),
  ((SELECT id FROM hotels WHERE name = 'Sunrise Oasis'), 'Coral View Room', 180.00, 2, 'Room overlooking coral reefs', 'https://example.com/images/coral_room.jpg', TRUE),
  ((SELECT id FROM hotels WHERE name = 'Sunrise Oasis'), 'Presidential Suite', 350.00, 4, 'Luxury suite with private pool', 'https://example.com/images/presidential_suite.jpg', TRUE),
  ((SELECT id FROM hotels WHERE name = 'Mountain Retreat'), 'Standard Room', 120.00, 2, 'Room with mountain view', 'https://example.com/images/mountain_standard.jpg', TRUE),
  ((SELECT id FROM hotels WHERE name = 'Blue Lagoon Hotel'), 'Water Park Room', 110.00, 2, 'Room with water park access', 'https://example.com/images/waterpark_room.jpg', TRUE),
  ((SELECT id FROM hotels WHERE name = 'Urban Stay'), 'City View Room', 90.00, 2, 'Modern room in downtown', 'https://example.com/images/city_room.jpg', TRUE),
  ((SELECT id FROM hotels WHERE name = 'The Pyramids Inn'), 'Pyramid View Room', 130.00, 2, 'Room facing the Pyramids', 'https://example.com/images/pyramid_room.jpg', TRUE),
  ((SELECT id FROM hotels WHERE name = 'Palm Garden Resort'), 'Beachfront Villa', 200.00, 4, 'Private villa with beach access', 'https://example.com/images/beach_villa.jpg', TRUE),
  ((SELECT id FROM hotels WHERE name = 'Lighthouse Hotel'), 'Lighthouse View Room', 95.00, 2, 'Room with coastal views', 'https://example.com/images/lighthouse_room.jpg', TRUE),
  ((SELECT id FROM hotels WHERE name = 'Luxor Royal Hotel'), 'Temple View Room', 125.00, 2, 'Room near Karnak Temple', 'https://example.com/images/temple_room.jpg', TRUE),
  ((SELECT id FROM hotels WHERE name = 'Nile Garden Inn'), 'Garden Room', 70.00, 2, 'Budget room with Nile view', 'https://example.com/images/garden_room.jpg', TRUE);

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();