import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MapState {
  center: [number, number]; // [lng, lat]
  zoom: number;
  selectedMarkerId: number | null;
  selectedMarkerType: 'pet' | 'sighting' | null;
}

const initialState: MapState = {
  center: [
    parseFloat(import.meta.env.VITE_DEFAULT_CENTER_LNG) || -122.4194,
    parseFloat(import.meta.env.VITE_DEFAULT_CENTER_LAT) || 37.7749,
  ],
  zoom: parseFloat(import.meta.env.VITE_DEFAULT_ZOOM) || 12,
  selectedMarkerId: null,
  selectedMarkerType: null,
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setCenter: (state, action: PayloadAction<[number, number]>) => {
      state.center = action.payload;
    },
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload;
    },
    selectMarker: (
      state,
      action: PayloadAction<{ id: number; type: 'pet' | 'sighting' } | null>
    ) => {
      if (action.payload) {
        state.selectedMarkerId = action.payload.id;
        state.selectedMarkerType = action.payload.type;
      } else {
        state.selectedMarkerId = null;
        state.selectedMarkerType = null;
      }
    },
  },
});

export const { setCenter, setZoom, selectMarker } = mapSlice.actions;
export default mapSlice.reducer;
