import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AllUsers = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/users/${id}/status`,
        { status: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      fetchUsers();
    } catch (err) {
      console.error('Failed to update user status', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">All Users</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white border rounded-lg shadow-lg p-4 transition hover:shadow-xl"
          >
            <h2 className="text-xl font-semibold">{user.username}</h2>
            <p className="text-sm text-gray-600">Email: {user.email}</p>
            <p className="text-sm">Role: {user.role}</p>
            <p className="text-sm">
              Created At: {new Date(user.createdAt).toLocaleString()}
            </p>
            <p
              className={`mt-2 font-semibold ${
                user.isActive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {user.isActive ? 'Active' : 'Blocked'}
            </p>
            <button
              onClick={() => toggleUserStatus(user.id, user.isActive)}
              className={`mt-4 w-full py-2 rounded text-white ${
                user.isActive
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {user.isActive ? 'Block User' : 'Unblock User'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllUsers;
