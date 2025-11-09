import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { petAPI } from '../../services/api';
import type { Pet, CreatePetData, MarkLostData } from '../../types';

interface PetState {
  pets: Pet[];
  currentPet: Pet | null;
  loading: boolean;
  error: string | null;
}

const initialState: PetState = {
  pets: [],
  currentPet: null,
  loading: false,
  error: null,
};

export const fetchMyPets = createAsyncThunk('pets/fetchMyPets', async () => {
  const response = await petAPI.getMyPets();
  return response.pets;
});

export const fetchPet = createAsyncThunk('pets/fetchPet', async (id: number) => {
  const response = await petAPI.getPet(id);
  return response.pet;
});

export const createPet = createAsyncThunk('pets/create', async (data: CreatePetData) => {
  const response = await petAPI.createPet(data);
  return response.pet;
});

export const markPetAsLost = createAsyncThunk(
  'pets/markAsLost',
  async ({ id, data }: { id: number; data: MarkLostData }) => {
    const response = await petAPI.markAsLost(id, data);
    return response.pet;
  }
);

export const markPetAsFound = createAsyncThunk('pets/markAsFound', async (id: number) => {
  const response = await petAPI.markAsFound(id);
  return response.pet;
});

const petSlice = createSlice({
  name: 'pets',
  initialState,
  reducers: {
    clearCurrentPet: (state) => {
      state.currentPet = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyPets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyPets.fulfilled, (state, action) => {
        state.loading = false;
        state.pets = action.payload;
      })
      .addCase(fetchMyPets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch pets';
      })
      .addCase(fetchPet.fulfilled, (state, action) => {
        state.currentPet = action.payload;
      })
      .addCase(createPet.fulfilled, (state, action) => {
        state.pets.push(action.payload);
      })
      .addCase(markPetAsLost.fulfilled, (state, action) => {
        const index = state.pets.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.pets[index] = action.payload;
        }
        if (state.currentPet?.id === action.payload.id) {
          state.currentPet = action.payload;
        }
      })
      .addCase(markPetAsFound.fulfilled, (state, action) => {
        const index = state.pets.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.pets[index] = action.payload;
        }
        if (state.currentPet?.id === action.payload.id) {
          state.currentPet = action.payload;
        }
      });
  },
});

export const { clearCurrentPet } = petSlice.actions;
export default petSlice.reducer;
