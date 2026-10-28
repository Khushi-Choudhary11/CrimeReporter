import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AssignedComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch assigned complaints on mount
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get(
          "http://localhost:5000/api/authority/assigned-complaints",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Filter out duplicates based on assignment_id
        const uniqueComplaints = Array.from(new Map(
          res.data.map(item => [item.assignment_id, item])
        ).values());
        
        setComplaints(uniqueComplaints);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        setError("Failed to load assigned complaints");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  // Handler for Accept/Reject
  const handleAction = async (assignmentId, action) => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `http://localhost:5000/api/authority/complaint/${assignmentId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Remove the complaint from the list after action
      setComplaints((prev) =>
        prev.filter((c) => c.assignment_id !== assignmentId)
      );
    } catch {
      alert("Action failed");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Assigned Complaints</h2>
      {complaints.length === 0 ? (
        <p>No assigned complaints.</p>
      ) : (
        <ul className="space-y-4">
          {complaints.map((c) => (
            <li key={c.assignment_id} className="border p-4 rounded shadow">
              <div>
                <strong>Title:</strong> {c.title}
              </div>
              <div>
                <strong>Description:</strong> {c.description}
              </div>
              <div>
                <strong>Severity:</strong> {c.severity}
              </div>
              <div>
                <strong>Status:</strong> {c.status}
              </div>
              <div className="mt-2 space-x-2">
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded"
                  onClick={() => handleAction(c.assignment_id, "accept")}
                >
                  Accept
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => handleAction(c.assignment_id, "reject")}
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
