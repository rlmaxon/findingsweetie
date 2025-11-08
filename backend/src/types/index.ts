export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
  email_verified: boolean;
  oauth_provider?: string;
  oauth_id?: string;
}

export interface Pet {
  id: number;
  owner_id: number;
  name: string;
  breed?: string;
  color?: string;
  age?: number;
  microchip?: string;
  description?: string;
  last_seen?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  last_seen_address?: string;
  last_seen_date?: Date;
  is_lost: boolean;
  search_radius_miles: number;
  photos: string[];
  created_at: Date;
  updated_at: Date;
  found_at?: Date;
  pet_type: 'dog' | 'cat' | 'bird' | 'other';
}

export interface Sighting {
  id: number;
  pet_id?: number;
  reporter_id?: number;
  photo: string;
  description?: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  location_address?: string;
  created_at: Date;
  ai_confidence?: number;
  is_confirmed: boolean;
  confirmed_at?: Date;
  confirmed_by?: number;
  metadata?: any;
}

export interface Notification {
  id: number;
  user_id: number;
  pet_id?: number;
  sighting_id?: number;
  message: string;
  sent_at: Date;
  delivery_method: 'email' | 'sms' | 'push';
  delivery_status: 'pending' | 'sent' | 'failed';
  read_at?: Date;
  metadata?: any;
}

export interface Watcher {
  id: number;
  user_id: number;
  watch_location: {
    type: 'Point';
    coordinates: [number, number];
  };
  watch_radius_miles: number;
  pet_types: string[];
  created_at: Date;
  is_active: boolean;
}

export interface AIMatchResult {
  confidence: number;
  model_version: string;
  pet_id: number;
  sighting_id: number;
  match: boolean;
}

export interface CreatePetRequest {
  name: string;
  breed?: string;
  color?: string;
  age?: number;
  microchip?: string;
  description?: string;
  pet_type?: 'dog' | 'cat' | 'bird' | 'other';
  photos?: string[];
}

export interface MarkLostRequest {
  last_seen_date: Date;
  last_seen_location: {
    latitude: number;
    longitude: number;
  };
  last_seen_address?: string;
  search_radius_miles?: number;
}

export interface CreateSightingRequest {
  pet_id?: number;
  photo: string;
  description?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  location_address?: string;
}
