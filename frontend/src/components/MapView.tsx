import React, { useState } from 'react';
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { setCenter, setZoom, selectMarker } from '../store/slices/mapSlice';
import type { Pet, Sighting } from '../types';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapViewProps {
  pets?: Pet[];
  sightings?: Sighting[];
}

const MapView: React.FC<MapViewProps> = ({ pets = [], sightings = [] }) => {
  const dispatch = useDispatch();
  const { center, zoom } = useSelector((state: RootState) => state.map);
  const [popupInfo, setPopupInfo] = useState<any>(null);

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

  const handleMarkerClick = (id: number, type: 'pet' | 'sighting', data: any) => {
    dispatch(selectMarker({ id, type }));
    setPopupInfo({ id, type, data });
  };

  return (
    <div className="h-full w-full">
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: center[0],
          latitude: center[1],
          zoom: zoom,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onMove={(evt) => {
          dispatch(setCenter([evt.viewState.longitude, evt.viewState.latitude]));
          dispatch(setZoom(evt.viewState.zoom));
        }}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />

        {/* Pet markers (red) */}
        {pets.map((pet) => {
          if (!pet.last_seen) return null;
          const [lng, lat] = pet.last_seen.coordinates;

          return (
            <Marker
              key={`pet-${pet.id}`}
              longitude={lng}
              latitude={lat}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handleMarkerClick(pet.id, 'pet', pet);
              }}
            >
              <div className="cursor-pointer">
                <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">🐾</span>
                </div>
              </div>
            </Marker>
          );
        })}

        {/* Sighting markers (blue or green if confirmed) */}
        {sightings.map((sighting) => {
          const [lng, lat] = sighting.location.coordinates;
          const color = sighting.is_confirmed ? 'green' : 'blue';

          return (
            <Marker
              key={`sighting-${sighting.id}`}
              longitude={lng}
              latitude={lat}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handleMarkerClick(sighting.id, 'sighting', sighting);
              }}
            >
              <div className="cursor-pointer">
                <div
                  className={`w-6 h-6 bg-${color}-500 rounded-full border-2 border-white shadow-lg`}
                  style={{ backgroundColor: color === 'green' ? '#10b981' : '#3b82f6' }}
                />
              </div>
            </Marker>
          );
        })}

        {/* Popup */}
        {popupInfo && (
          <Popup
            longitude={
              popupInfo.type === 'pet'
                ? popupInfo.data.last_seen.coordinates[0]
                : popupInfo.data.location.coordinates[0]
            }
            latitude={
              popupInfo.type === 'pet'
                ? popupInfo.data.last_seen.coordinates[1]
                : popupInfo.data.location.coordinates[1]
            }
            anchor="top"
            onClose={() => setPopupInfo(null)}
            className="max-w-xs"
          >
            <div className="p-2">
              {popupInfo.type === 'pet' ? (
                <>
                  <h3 className="font-bold text-lg">{popupInfo.data.name}</h3>
                  <p className="text-sm text-gray-600">{popupInfo.data.breed}</p>
                  <p className="text-sm text-gray-600">
                    Last seen: {new Date(popupInfo.data.last_seen_date).toLocaleDateString()}
                  </p>
                  {popupInfo.data.photos && popupInfo.data.photos.length > 0 && (
                    <img
                      src={popupInfo.data.photos[0]}
                      alt={popupInfo.data.name}
                      className="w-full h-32 object-cover rounded mt-2"
                    />
                  )}
                </>
              ) : (
                <>
                  <h3 className="font-bold text-lg">Sighting</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(popupInfo.data.created_at).toLocaleString()}
                  </p>
                  {popupInfo.data.ai_confidence && (
                    <p className="text-sm font-semibold text-blue-600">
                      Match: {(popupInfo.data.ai_confidence * 100).toFixed(1)}%
                    </p>
                  )}
                  {popupInfo.data.description && (
                    <p className="text-sm mt-1">{popupInfo.data.description}</p>
                  )}
                  <img
                    src={popupInfo.data.photo}
                    alt="Sighting"
                    className="w-full h-32 object-cover rounded mt-2"
                  />
                </>
              )}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default MapView;
