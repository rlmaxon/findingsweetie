-- Database setup script for Finding Sweetie
-- Run as postgres user: sudo -u postgres psql -f setup-database.sql

-- Create database
DROP DATABASE IF EXISTS findingsweetie;
CREATE DATABASE findingsweetie;

-- Connect to database
\c findingsweetie;

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create application user
DROP USER IF EXISTS findingsweetie_user;
CREATE USER findingsweetie_user WITH PASSWORD 'changeme_in_production';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE findingsweetie TO findingsweetie_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO findingsweetie_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO findingsweetie_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO findingsweetie_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO findingsweetie_user;

-- Import schema
\i ../database/schema.sql

\echo 'Database setup complete!'
\echo 'Default password: changeme_in_production'
\echo 'Remember to change the password in production!'
