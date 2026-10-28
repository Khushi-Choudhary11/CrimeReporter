import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ApproveAuthorities = () => {
  const [authorities, setAuthorities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuthorities();
  }, []);

  const fetchAuthorities = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/authorities');
      setAuthorities(res.data);
    } catch (err) {
      // handle error
      console.log("error")
    }
    setLoading(false);
  };

  const approveAuthority = async (id) => {
    try {
      await axios.patch(`/api/authorities/${id}/approve`);
      setAuthorities((prev) => prev.map(a => a._id === id ? { ...a, approved: true } : a));
    } catch (err) {
      // handle error
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Registered Authorities</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border">Name</th>
            <th className="py-2 px-4 border">Description</th>
            <th className="py-2 px-4 border">Status</th>
            <th className="py-2 px-4 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {authorities.map((auth) => (
            <tr key={auth._id}>
              <td className="py-2 px-4 border">{auth.name}</td>
              <td className="py-2 px-4 border">{auth.description}</td>
              <td className="py-2 px-4 border">{auth.approved ? 'Approved' : 'Pending'}</td>
              <td className="py-2 px-4 border">
                {!auth.approved && (
                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded"
                    onClick={() => approveAuthority(auth._id)}
                  >
                    Approve
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApproveAuthorities;
