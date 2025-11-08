import React from 'react';
import { Link } from 'react-router-dom';
import type { Pet } from '../types';

interface PetCardProps {
  pet: Pet;
}

const PetCard: React.FC<PetCardProps> = ({ pet }) => {
  return (
    <Link
      to={`/pets/${pet.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
    >
      {pet.photos && pet.photos.length > 0 ? (
        <img
          src={pet.photos[0]}
          alt={pet.name}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <span className="text-6xl">🐾</span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold">{pet.name}</h3>
          {pet.is_lost && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded">
              LOST
            </span>
          )}
        </div>

        <div className="space-y-1 text-sm text-gray-600">
          {pet.breed && <p>Breed: {pet.breed}</p>}
          {pet.color && <p>Color: {pet.color}</p>}
          {pet.age !== undefined && <p>Age: {pet.age} years</p>}
        </div>

        {pet.is_lost && pet.last_seen_date && (
          <div className="mt-3 text-sm text-red-600">
            Last seen: {new Date(pet.last_seen_date).toLocaleDateString()}
          </div>
        )}
      </div>
    </Link>
  );
};

export default PetCard;
