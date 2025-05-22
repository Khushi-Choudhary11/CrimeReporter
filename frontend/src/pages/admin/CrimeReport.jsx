import React, { useEffect, useState } from "react";
import axios from "axios";

const statusOptions = ['pending', 'accepted', 'rejected'];

export default function AdminComplaintViewer() {
  const [status, setStatus] = useState('pending');
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState(null);

  // Fetch complaints based on the selected status
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get(`/admin/complaints?status=${status}`);
        setComplaints(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch complaints.");
        setComplaints([]);
      }
    };

    fetchComplaints();
  }, [status]);

  // Handle status change (from dropdown)
  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Complaint Assignments - {status.charAt(0).toUpperCase() + status.slice(1)}</h1>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {complaints.map((complaint) => (
            <div key={complaint.complaint_id} className="bg-white rounded shadow p-4">
              <h2 className="text-lg font-semibold text-gray-800">#{complaint.complaint_id} — {complaint.crime_report_title}</h2>
              <p className="text-sm text-gray-600 mt-1">{complaint.crime_report_description}</p>
              <p className="text-sm mt-2"><strong>Assigned To:</strong> {complaint.authority_name}</p>
              <p className="text-sm"><strong>Assigned At:</strong> {new Date(complaint.assigned_at).toLocaleDateString()}</p>
              {complaint.responded_at && (
                <p className="text-sm"><strong>Responded At:</strong> {new Date(complaint.responded_at).toLocaleDateString()}</p>
              )}
              <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                complaint.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : complaint.status === "accepted"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}>
                {complaint.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
