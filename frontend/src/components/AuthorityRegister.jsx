import React, { useState } from "react";
import { authService } from '../services/api';

const JURISDICTION=[
  'Theft',
'Assault',
'Vandalism',
'Fraud',
'Harassment',
'Traffic Violation',
'Domestic Violence',
'Robbery',
'Burglary',
'Other'
]
const DEPARTMENTS = [
  'Police',
  'Traffic Police',
  'Crime Branch',
  'Cyber Crime',
  'Anti-Corruption',
  'Special Branch',
  'Intelligence',
  'Investigation',
  'Security',
  'Other'
];

export default function AuthorityRegister() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    badge_number: "",
    department: "",
    jurisdiction: "",
    phone_number: ""
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authService.registerAuthority({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        badge_number: formData.badge_number,
        department: formData.department,
        jurisdiction: formData.jurisdiction,
        phone_number: formData.phone_number
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-red-500 mb-4">Authority Registration</h2>
        <input name="username" placeholder="Username" onChange={handleChange} className="w-full p-3 mb-4 rounded bg-gray-700 placeholder-gray-400" />
        <input name="email" placeholder="Email" type="email" onChange={handleChange} className="w-full p-3 mb-4 rounded bg-gray-700 placeholder-gray-400" />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full p-3 mb-4 rounded bg-gray-700 placeholder-gray-400" />
        <input name="badge_number" placeholder="Badge Number" onChange={handleChange} className="w-full p-3 mb-4 rounded bg-gray-700 placeholder-gray-400" />
        <select 
          name="department" 
          onChange={handleChange} 
          className="w-full p-3 mb-4 rounded bg-gray-700 text-white"
          required
        >
          <option value="" disabled selected>Select Department</option>
          {DEPARTMENTS.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
        <select 
          name="jurisdiction" 
          onChange={handleChange} 
          className="w-full p-3 mb-4 rounded bg-gray-700 text-white"
          required
        >
          <option value="" disabled selected>Select Jurisdiction</option>
          {JURISDICTION.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>        
        <input name="phone_number" placeholder="Phone Number" onChange={handleChange} className="w-full p-3 mb-4 rounded bg-gray-700 placeholder-gray-400" />
        <button type="submit" className="w-full p-3 bg-red-600 hover:bg-red-700 rounded font-semibold">Register</button>
      </form>
    </div>
  );
}