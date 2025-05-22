import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminApi';

export default function VerifyAuthorities() {
  const [authorities, setAuthorities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchAuthorities();
  }, []);

  const fetchAuthorities = async () => {
    try {
      const data = await adminService.getAuthorities();
      setAuthorities(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load authorities');
      setLoading(false);
    }
  };

  const handleVerification = async (authorityId, status) => {
    try {
      await adminService.verifyAuthority(authorityId, status);
      fetchAuthorities();
    } catch (err) {
      setError('Failed to update authority status');
    }
  };

  const filteredAuthorities = authorities.filter(authority => 
    filter === 'all' ? true : authority.status === filter
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Verify Authorities</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        <div className="mb-6">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Authorities</option>
            <option value="pending">Pending Verification</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuthorities.map((authority) => (
            <div key={authority.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  {authority.avatar ? (
                    <img src={authority.avatar} alt="" className="h-12 w-12 rounded-full" />
                  ) : (
                    <span className="text-2xl text-gray-500">{authority.name[0]}</span>
                  )}
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900">{authority.name}</h2>
                  <p className="text-sm text-gray-500">{authority.designation}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Department:</span> {authority.department}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">ID Number:</span> {authority.idNumber}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Contact:</span> {authority.contact}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Status:</span>
                  <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${authority.status === 'verified' ? 'bg-green-100 text-green-800' :
                      authority.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'}`}>
                    {authority.status}
                  </span>
                </p>
              </div>

              {authority.status === 'pending' && (
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => handleVerification(authority.id, 'verified')}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => handleVerification(authority.id, 'rejected')}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              )}

              {authority.status !== 'pending' && (
                <button
                  onClick={() => handleVerification(authority.id, 'pending')}
                  className="mt-4 w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                >
                  Reset Status
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}