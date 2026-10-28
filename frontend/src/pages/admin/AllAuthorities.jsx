import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AllAuthorities = () => {
  const [authorities, setAuthorities] = useState([]);

  const fetchAuthorities = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/authorities', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setAuthorities(res.data);
    } catch (err) {
      console.error('Failed to fetch authorities', err);
    }
  };

  const toggleAuthorityStatus = async (id, currentStatus) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/authorities/${id}/status`,
        { status: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      fetchAuthorities();
    } catch (err) {
      console.error('Failed to update authority status', err);
    }
  };

  useEffect(() => {
    fetchAuthorities();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">All Authorities</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {authorities.map((auth) => (
          <div
            key={auth.id}
            className="bg-white border rounded-lg shadow-lg p-4 transition hover:shadow-xl"
          >
            <h2 className="text-xl font-semibold">{auth.username}</h2>
            <p className="text-sm text-gray-600">Email: {auth.email}</p>
            <p className="text-sm">Badge Number: {auth.badgeNumber}</p>
            <p className="text-sm">Department: {auth.department}</p>
            <p className="text-sm">
              Created At: {new Date(auth.createdAt).toLocaleString()}
            </p>
            <p
              className={`mt-2 font-semibold ${
                auth.isActive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {auth.isActive ? 'Active' : 'Blocked'}
            </p>
            <button
              onClick={() => toggleAuthorityStatus(auth.id, auth.isActive)}
              className={`mt-4 w-full py-2 rounded text-white ${
                auth.isActive
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {auth.isActive ? 'Block Authority' : 'Unblock Authority'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllAuthorities;
