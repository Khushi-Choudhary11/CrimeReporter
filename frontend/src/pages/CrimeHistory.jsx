import React, { useState, useEffect } from 'react';
import { crimeService } from '../services/api';

const CrimeHistory = () => {
  const [crimes, setCrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCrimeHistory = async () => {
      try {
        setLoading(true);
        const response = await crimeService.getUserCrimeHistory();
        setCrimes(response.data.reports || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching crime history:", err);
        setError(err.response?.data?.message || "Failed to load your crime history");
        setLoading(false);
      }
    };

    fetchCrimeHistory();
  }, []);

  if (loading) {
    return <div className="p-6 flex justify-center">Loading crime history...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Crime Reports</h1>
      
      {crimes.length === 0 ? (
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-blue-700">You haven't reported any crimes yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {crimes.map((crime) => (
            <div key={crime.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h2 className="font-semibold text-lg">{crime.title}</h2>
              <p className="text-gray-700 my-2">{crime.description}</p>
              <div className="flex flex-wrap gap-3 text-sm mt-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{crime.category}</span>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Status: {crime.status}</span>
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                  Reported: {new Date(crime.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CrimeHistory;
