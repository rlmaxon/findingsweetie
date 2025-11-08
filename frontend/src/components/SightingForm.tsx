import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createSighting } from '../store/slices/sightingSlice';
import type { AppDispatch } from '../store';
import { toast } from 'react-toastify';

interface SightingFormProps {
  petId?: number;
  onSuccess?: () => void;
}

const SightingForm: React.FC<SightingFormProps> = ({ petId, onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState({
    photo: '',
    description: '',
    location: {
      latitude: 0,
      longitude: 0,
    },
    location_address: '',
  });
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          }));
          toast.success('Location captured!');
        },
        (error) => {
          toast.error('Failed to get location. Please enter manually.');
          setUseCurrentLocation(false);
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.photo) {
      toast.error('Please provide a photo URL');
      return;
    }

    if (formData.location.latitude === 0 && formData.location.longitude === 0) {
      toast.error('Please provide a location');
      return;
    }

    try {
      await dispatch(
        createSighting({
          pet_id: petId,
          photo: formData.photo,
          description: formData.description,
          location: formData.location,
          location_address: formData.location_address,
        })
      ).unwrap();

      toast.success('Sighting reported successfully!');
      setFormData({
        photo: '',
        description: '',
        location: { latitude: 0, longitude: 0 },
        location_address: '',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('Failed to report sighting');
    }
  };

  React.useEffect(() => {
    if (useCurrentLocation) {
      handleGetLocation();
    }
  }, [useCurrentLocation]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Photo URL *
        </label>
        <input
          type="url"
          value={formData.photo}
          onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="https://example.com/photo.jpg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={3}
          placeholder="Describe what you saw..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location Address
        </label>
        <input
          type="text"
          value={formData.location_address}
          onChange={(e) =>
            setFormData({ ...formData, location_address: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="123 Main St, City, State"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={useCurrentLocation}
          onChange={(e) => setUseCurrentLocation(e.target.checked)}
          className="rounded"
        />
        <label className="text-sm text-gray-700">Use my current location</label>
      </div>

      {!useCurrentLocation && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitude *
            </label>
            <input
              type="number"
              step="any"
              value={formData.location.latitude}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: { ...formData.location, latitude: parseFloat(e.target.value) },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude *
            </label>
            <input
              type="number"
              step="any"
              value={formData.location.longitude}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: { ...formData.location, longitude: parseFloat(e.target.value) },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors font-medium"
      >
        Report Sighting
      </button>
    </form>
  );
};

export default SightingForm;
