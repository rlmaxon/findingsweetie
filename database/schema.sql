-- Finding Sweetie Database Schema
-- PostgreSQL with PostGIS extension for geospatial data

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  oauth_provider VARCHAR(50),
  oauth_id VARCHAR(255)
);

-- Index for email lookups
CREATE INDEX idx_users_email ON users(email);

-- Pets table
CREATE TABLE pets (
  id SERIAL PRIMARY KEY,
  owner_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  breed VARCHAR(100),
  color VARCHAR(100),
  age INT,
  microchip VARCHAR(50),
  description TEXT,
  last_seen GEOGRAPHY(Point, 4326),
  last_seen_address TEXT,
  last_seen_date TIMESTAMP,
  is_lost BOOLEAN DEFAULT FALSE,
  search_radius_miles DECIMAL(5,2) DEFAULT 3.0,
  photos TEXT[], -- Array of S3 URLs
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  found_at TIMESTAMP,
  pet_type VARCHAR(50) DEFAULT 'dog' CHECK (pet_type IN ('dog', 'cat', 'bird', 'other'))
);

-- Indexes for pet queries
CREATE INDEX idx_pets_owner ON pets(owner_id);
CREATE INDEX idx_pets_is_lost ON pets(is_lost);
CREATE INDEX idx_pets_last_seen ON pets USING GIST(last_seen);

-- Sightings table
CREATE TABLE sightings (
  id SERIAL PRIMARY KEY,
  pet_id INT REFERENCES pets(id) ON DELETE CASCADE,
  reporter_id INT REFERENCES users(id) ON DELETE SET NULL,
  photo TEXT NOT NULL,
  description TEXT,
  location GEOGRAPHY(Point, 4326) NOT NULL,
  location_address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  ai_confidence FLOAT,
  is_confirmed BOOLEAN DEFAULT FALSE,
  confirmed_at TIMESTAMP,
  confirmed_by INT REFERENCES users(id),
  metadata JSONB -- Additional data like weather, time of day, etc.
);

-- Indexes for sighting queries
CREATE INDEX idx_sightings_pet ON sightings(pet_id);
CREATE INDEX idx_sightings_location ON sightings USING GIST(location);
CREATE INDEX idx_sightings_created ON sightings(created_at);
CREATE INDEX idx_sightings_confidence ON sightings(ai_confidence);

-- Notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pet_id INT REFERENCES pets(id) ON DELETE CASCADE,
  sighting_id INT REFERENCES sightings(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  delivery_method VARCHAR(20) NOT NULL CHECK (delivery_method IN ('email','sms','push')),
  delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN ('pending','sent','failed')),
  read_at TIMESTAMP,
  metadata JSONB
);

-- Indexes for notification queries
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_sent ON notifications(sent_at);
CREATE INDEX idx_notifications_status ON notifications(delivery_status);

-- Watchers table (users who want to be notified of lost pets in their area)
CREATE TABLE watchers (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  watch_location GEOGRAPHY(Point, 4326) NOT NULL,
  watch_radius_miles DECIMAL(5,2) DEFAULT 5.0,
  pet_types VARCHAR(50)[], -- Array of pet types to watch for
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Indexes for watcher queries
CREATE INDEX idx_watchers_user ON watchers(user_id);
CREATE INDEX idx_watchers_location ON watchers USING GIST(watch_location);

-- AI Match Cache table (to avoid re-processing same image pairs)
CREATE TABLE ai_match_cache (
  id SERIAL PRIMARY KEY,
  pet_photo_hash VARCHAR(64) NOT NULL,
  sighting_photo_hash VARCHAR(64) NOT NULL,
  confidence_score FLOAT NOT NULL,
  model_version VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(pet_photo_hash, sighting_photo_hash)
);

-- Index for cache lookups
CREATE INDEX idx_match_cache_hashes ON ai_match_cache(pet_photo_hash, sighting_photo_hash);

-- Social Shares table (track sharing analytics)
CREATE TABLE social_shares (
  id SERIAL PRIMARY KEY,
  pet_id INT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('facebook','instagram','nextdoor','reddit','twitter','other')),
  shared_at TIMESTAMP DEFAULT NOW(),
  share_url TEXT
);

-- Index for share analytics
CREATE INDEX idx_social_shares_pet ON social_shares(pet_id);
CREATE INDEX idx_social_shares_platform ON social_shares(platform);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON pets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to find nearby sightings
CREATE OR REPLACE FUNCTION find_nearby_sightings(
  pet_location GEOGRAPHY,
  radius_miles DECIMAL
)
RETURNS TABLE (
  sighting_id INT,
  distance_miles DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    ST_Distance(s.location, pet_location)::DECIMAL / 1609.34 AS distance_miles
  FROM sightings s
  WHERE ST_DWithin(s.location, pet_location, radius_miles * 1609.34)
  ORDER BY distance_miles ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to find lost pets near a location
CREATE OR REPLACE FUNCTION find_lost_pets_nearby(
  search_location GEOGRAPHY,
  radius_miles DECIMAL
)
RETURNS TABLE (
  pet_id INT,
  pet_name VARCHAR,
  distance_miles DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    ST_Distance(p.last_seen, search_location)::DECIMAL / 1609.34 AS distance_miles
  FROM pets p
  WHERE p.is_lost = TRUE
    AND ST_DWithin(p.last_seen, search_location, radius_miles * 1609.34)
  ORDER BY distance_miles ASC;
END;
$$ LANGUAGE plpgsql;
