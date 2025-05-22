import React from "react";
import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">User Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div
          onClick={() => navigate("/nearby-crimes")}
          className="bg-red-100 hover:bg-red-200 border border-red-300 p-6 rounded-lg cursor-pointer shadow-lg"
        >
          <h2 className="text-xl font-semibold text-red-700 mb-2">See Nearby Crimes</h2>
          <p className="text-gray-600">Click to view recent crimes around your location.</p>
        </div>

        <div
          onClick={() => navigate("/report-crime")}
          className="bg-blue-100 hover:bg-blue-200 border border-blue-300 p-6 rounded-lg cursor-pointer shadow-lg"
        >
          <h2 className="text-xl font-semibold text-blue-700 mb-2">Report a Crime</h2>
          <p className="text-gray-600">Help keep your community safe by reporting incidents.</p>
        </div>

        <div
          onClick={() => navigate("/my-crime-history")}
          className="bg-green-100 hover:bg-green-200 border border-green-300 p-6 rounded-lg cursor-pointer shadow-lg"
        >
          <h2 className="text-xl font-semibold text-green-700 mb-2">My Crime History</h2>
          <p className="text-gray-600">Review crimes you've previously reported.</p>
        </div>

        <div
          onClick={() => navigate("/chat-authority")}
          className="bg-purple-100 hover:bg-purple-200 border border-purple-300 p-6 rounded-lg cursor-pointer shadow-lg"
        >
          <h2 className="text-xl font-semibold text-purple-700 mb-2">Chat with Authorities</h2>
          <p className="text-gray-600">Communicate directly with law enforcement about your concerns.</p>
        </div>

      </div>
    </div>
  );
}