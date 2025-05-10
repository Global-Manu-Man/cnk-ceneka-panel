import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';

interface Property {
  id: number;
  title: string;
  price: number;
  location: string;
  beds: number;
  baths: number;
  sqft: number;
  images: string[];
  created_at: string;
}

export default function PropertyList() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { idToken, isAuthenticated } = useFirebaseAuth();

  const fetchProperties = async () => {
    try {
      if (!isAuthenticated || !idToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch('https://cnk-ceneka.onrender.com/api/properties', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch properties');
      }

      const data = await response.json();
      
      // Validar y transformar los datos
      const validProperties = Array.isArray(data) ? data : [];
      setProperties(validProperties);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [idToken, isAuthenticated]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Properties</h2>
        <Link
          to="/properties/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Property
        </Link>
      </div>
      <div className="border-t border-gray-200">
        {properties.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No properties found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first property.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {properties.map((property) => (
              <li key={property.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {property.images?.[0] && (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="h-16 w-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {property.title || 'Untitled Property'}
                      </h3>
                      <p className="text-sm text-gray-500">{property.location || 'No location specified'}</p>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <span className="mr-4">{property.beds || 0} beds</span>
                        <span className="mr-4">{property.baths || 0} baths</span>
                        <span>{property.sqft || 0} sqft</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg font-medium text-gray-900">
                      ${(property.price || 0).toLocaleString()}
                    </span>
                    <Link
                      to={`/properties/${property.id}`}
                      className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}