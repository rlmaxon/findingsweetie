import axios from 'axios';
import type {
  Pet,
  Sighting,
  CreatePetData,
  MarkLostData,
  CreateSightingData,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (email: string, password: string, firstName?: string, lastName?: string) => {
    const response = await api.post('/auth/register', { email, password, firstName, lastName });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};

export const petAPI = {
  createPet: async (data: CreatePetData): Promise<{ pet: Pet }> => {
    const response = await api.post('/pets', data);
    return response.data;
  },

  getPet: async (id: number): Promise<{ pet: Pet }> => {
    const response = await api.get(`/pets/${id}`);
    return response.data;
  },

  getMyPets: async (): Promise<{ pets: Pet[] }> => {
    const response = await api.get('/pets/my/pets');
    return response.data;
  },

  markAsLost: async (id: number, data: MarkLostData): Promise<{ pet: Pet }> => {
    const response = await api.post(`/pets/${id}/lost`, data);
    return response.data;
  },

  markAsFound: async (id: number): Promise<{ pet: Pet }> => {
    const response = await api.post(`/pets/${id}/found`);
    return response.data;
  },

  updatePet: async (id: number, data: Partial<CreatePetData>): Promise<{ pet: Pet }> => {
    const response = await api.put(`/pets/${id}`, data);
    return response.data;
  },

  deletePet: async (id: number): Promise<void> => {
    await api.delete(`/pets/${id}`);
  },

  findNearby: async (lat: number, lng: number, radius?: number): Promise<{ lostPets: any[] }> => {
    const response = await api.get('/pets/nearby', {
      params: { latitude: lat, longitude: lng, radius },
    });
    return response.data;
  },
};

export const sightingAPI = {
  createSighting: async (data: CreateSightingData): Promise<{ sighting: Sighting }> => {
    const response = await api.post('/sightings', data);
    return response.data;
  },

  getSighting: async (id: number): Promise<{ sighting: Sighting }> => {
    const response = await api.get(`/sightings/${id}`);
    return response.data;
  },

  getSightingsByPet: async (petId: number, limit?: number): Promise<{ sightings: Sighting[] }> => {
    const response = await api.get(`/sightings/pet/${petId}`, {
      params: { limit },
    });
    return response.data;
  },

  getSightingsNearby: async (
    lat: number,
    lng: number,
    radius?: number,
    limit?: number
  ): Promise<{ sightings: Sighting[] }> => {
    const response = await api.get('/sightings/nearby', {
      params: { latitude: lat, longitude: lng, radius, limit },
    });
    return response.data;
  },

  confirmSighting: async (id: number): Promise<{ sighting: Sighting }> => {
    const response = await api.post(`/sightings/${id}/confirm`);
    return response.data;
  },
};

export default api;
