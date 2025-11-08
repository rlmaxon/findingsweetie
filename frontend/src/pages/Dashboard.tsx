import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyPets } from '../store/slices/petSlice';
import type { AppDispatch, RootState } from '../store';
import PetCard from '../components/PetCard';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { pets, loading } = useSelector((state: RootState) => state.pets);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchMyPets());
  }, [dispatch]);

  const lostPets = pets.filter((pet) => pet.is_lost);
  const foundPets = pets.filter((pet) => !pet.is_lost);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName || 'there'}!
        </h1>
        <p className="mt-2 text-gray-600">Manage your pets and sightings</p>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Pets</h2>
        <Link
          to="/pets/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
        >
          + Add Pet
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : pets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">You haven't registered any pets yet.</p>
          <Link
            to="/pets/new"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors"
          >
            Register Your First Pet
          </Link>
        </div>
      ) : (
        <>
          {lostPets.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-red-600 mb-4">Lost Pets</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lostPets.map((pet) => (
                  <PetCard key={pet.id} pet={pet} />
                ))}
              </div>
            </div>
          )}

          {foundPets.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">All Pets</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {foundPets.map((pet) => (
                  <PetCard key={pet.id} pet={pet} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
