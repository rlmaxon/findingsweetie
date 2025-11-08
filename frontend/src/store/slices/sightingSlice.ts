import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sightingAPI } from '../../services/api';
import type { Sighting, CreateSightingData } from '../../types';

interface SightingState {
  sightings: Sighting[];
  currentSighting: Sighting | null;
  loading: boolean;
  error: string | null;
}

const initialState: SightingState = {
  sightings: [],
  currentSighting: null,
  loading: false,
  error: null,
};

export const fetchSightingsByPet = createAsyncThunk(
  'sightings/fetchByPet',
  async (petId: number) => {
    const response = await sightingAPI.getSightingsByPet(petId);
    return response.sightings;
  }
);

export const createSighting = createAsyncThunk(
  'sightings/create',
  async (data: CreateSightingData) => {
    const response = await sightingAPI.createSighting(data);
    return response.sighting;
  }
);

export const confirmSighting = createAsyncThunk('sightings/confirm', async (id: number) => {
  const response = await sightingAPI.confirmSighting(id);
  return response.sighting;
});

const sightingSlice = createSlice({
  name: 'sightings',
  initialState,
  reducers: {
    clearSightings: (state) => {
      state.sightings = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSightingsByPet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSightingsByPet.fulfilled, (state, action) => {
        state.loading = false;
        state.sightings = action.payload;
      })
      .addCase(fetchSightingsByPet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sightings';
      })
      .addCase(createSighting.fulfilled, (state, action) => {
        state.sightings.unshift(action.payload);
      })
      .addCase(confirmSighting.fulfilled, (state, action) => {
        const index = state.sightings.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.sightings[index] = action.payload;
        }
      });
  },
});

export const { clearSightings } = sightingSlice.actions;
export default sightingSlice.reducer;
