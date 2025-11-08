export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
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
    coordinates: [number, number]; // [lng, lat]
  };
  last_seen_address?: string;
  last_seen_date?: string;
  is_lost: boolean;
  search_radius_miles: number;
  photos: string[];
  created_at: string;
  updated_at: string;
  found_at?: string;
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
    coordinates: [number, number]; // [lng, lat]
  };
  location_address?: string;
  created_at: string;
  ai_confidence?: number;
  is_confirmed: boolean;
  confirmed_at?: string;
  confirmed_by?: number;
  distance_miles?: number;
}

export interface Notification {
  id: number;
  user_id: number;
  pet_id?: number;
  sighting_id?: number;
  message: string;
  sent_at: string;
  delivery_method: 'email' | 'sms' | 'push';
  delivery_status: 'pending' | 'sent' | 'failed';
  read_at?: string;
}

export interface MapMarker {
  type: 'pet' | 'sighting';
  id: number;
  coordinates: [number, number];
  data: Pet | Sighting;
}

export interface CreatePetData {
  name: string;
  breed?: string;
  color?: string;
  age?: number;
  microchip?: string;
  description?: string;
  pet_type?: 'dog' | 'cat' | 'bird' | 'other';
}

export interface MarkLostData {
  last_seen_date: string;
  last_seen_location: {
    latitude: number;
    longitude: number;
  };
  last_seen_address?: string;
  search_radius_miles?: number;
}

export interface CreateSightingData {
  pet_id?: number;
  photo: string;
  description?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  location_address?: string;
}
