import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from "recharts";

export default function CrimeAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("month");
  const [analyticsData, setAnalyticsData] = useState({
    crimesByType: [],
    crimesByLocation: [],
    crimesTrend: [],
    crimesSeverity: [],
    totalReports: 0,
    solvedCases: 0,
    pendingCases: 0,
    criticalCases: 0,
    crimesByStatus: [],
    crimesByCode: []
  });

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#D62728"];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await adminService.getCrimeAnalytics(timeRange);
        setAnalyticsData({
          crimesByType: data.crimesByType || [],
          crimesByLocation: data.crimesByLocation || [],
          crimesTrend: data.crimesTrend || [],
          crimesSeverity: data.crimesSeverity || [],
          totalReports: data.totalReports || 0,
          solvedCases: data.solvedCases || 0,
          pendingCases: data.pendingCases || 0,
          criticalCases: data.criticalCases || 0,
          crimesByStatus: data.crimesByStatus || [],
          crimesByCode: data.crimesByCode || []
        });
        setLoading(false);
      } catch (err) {
        setError("Failed to load analytics data");
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Crime Analytics</h1>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[
            { label: "Total Reports", value: analyticsData.totalReports, color: "blue" },
            { label: "Solved Cases", value: analyticsData.solvedCases, color: "green" },
            { label: "Pending Cases", value: analyticsData.pendingCases, color: "yellow" },
            { label: "Critical Cases", value: analyticsData.criticalCases, color: "red" }
          ].map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className={`p-3 bg-${item.color}-100 rounded-full`}>
                  <div className={`h-6 w-6 text-${item.color}-600`}>●</div>
                </div>
                <div className="ml-4">
                  <h2 className="text-sm text-gray-600 uppercase">{item.label}</h2>
                  <p className="text-2xl font-bold text-gray-800">{item.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Crimes by Resolution Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Resolved vs Unresolved Cases</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.crimesByStatus || []}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {(analyticsData.crimesByStatus || []).map((entry, index) => (
                      <Cell key={`status-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Crimes by Status Code */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Crimes by Status Code</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.crimesByCode || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="statusCode" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Crimes by Type */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Crimes by Type</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.crimesByType || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
