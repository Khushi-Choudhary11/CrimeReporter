import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md min-h-[50vh] flex items-center justify-center">
      <div className="bg-gradient-to-b from-indigo-600 to-light-blue-700 text-white p-16 rounded-lg w-full h-full flex flex-col items-center justify-center">
        <h1 className="text-7xl font-bold mb-8">Welcome to Admin Dashboard</h1>
        <p className="text-2xl italic">
          "With great power comes great responsibility"
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;