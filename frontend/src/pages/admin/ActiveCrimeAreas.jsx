import React, { useEffect, useState } from "react";
import axios from "axios";

const statusOptions = ['pending', 'accepted', 'rejected'];

export default function AdminComplaintViewer() {
  const [status, setStatus] = useState('pending');
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/admin/admin/complaints?status=${status}`);
        setComplaints(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch complaints.");
        setComplaints([]);
      }
    };

    fetchComplaints();
  }, [status]);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          Complaint Assignments - {status.charAt(0).toUpperCase() + status.slice(1)}
        </h1>

        <div className="mb-4">
          <select
            value={status}
            onChange={handleStatusChange}
            className="p-2 border rounded-lg"
          >
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((complaint) => (
            <div key={complaint.complaint_id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-gray-800">#{complaint.complaint_id}</h2>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  complaint.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : complaint.status === "accepted"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {complaint.status.toUpperCase()}
                </span>
              </div>

              <p className="text-md font-semibold text-blue-700">
                {complaint.crime_report_title}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                {complaint.crime_report_description}
              </p>

              <div className="mt-3 text-sm text-gray-800">
                <p><strong>Location:</strong> {complaint.location}</p>
                <p><strong>Pincode:</strong> {complaint.pincode}</p>
                <p><strong>Reporter:</strong> {complaint.reporter_name}</p>
                <p><strong>Contact:</strong> {complaint.contact_info}</p>
              </div>

              <div className="mt-4 border-t pt-3 text-sm text-gray-600">
                <p><strong>Assigned To:</strong> {complaint.authority_name}</p>
                <p><strong>Assigned At:</strong> {complaint.assigned_at}</p>
                {complaint.responded_at && (
                  <p><strong>Responded At:</strong> {complaint.responded_at}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
