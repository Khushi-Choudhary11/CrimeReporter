import React, { useEffect, useState } from 'react';
import { crimeService } from '../services/api';

const MyCrimeHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    crimeService.getUserCrimeHistory()
      .then(response => {
        console.log("FULL API RESPONSE:", response);
        console.log("RESPONSE DATA:", response.data);
        
        // Try different paths to find reports array
        const reportsFromResponseData = response.data?.reports || [];
        const reportsDirectly = Array.isArray(response.data) ? response.data : [];
        
        console.log("REPORTS FROM .data.reports:", reportsFromResponseData);
        console.log("REPORTS DIRECTLY FROM .data:", reportsDirectly);
        
        // Use whichever has data
        const finalReports = reportsFromResponseData.length > 0 ? 
          reportsFromResponseData : reportsDirectly;
        
        setHistory(finalReports);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching history:", err);
        setError("Failed to load your crime history");
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading your crime history...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="crime-history">
      <h2>My Crime Reports</h2>
      {history.length === 0 ? (
        <p>You haven't reported any crimes yet.</p>
      ) : (
        <div className="crime-list">
          {history.map(crime => (
            <div key={crime.id} className="crime-card">
              <h3>{crime.title}</h3>
              <p>{crime.description}</p>
              <div className="crime-meta">
                <span>Category: {crime.category}</span>
                <span>Status: {crime.status}</span>
                <span>Date: {new Date(crime.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCrimeHistory;
