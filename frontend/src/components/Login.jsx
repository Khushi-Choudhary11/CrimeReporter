import React, { useState } from "react";
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({
    role: "",
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await authService.login({ username: formData.username, password: formData.password });
      console.log('Login response:', data); // Debug: see what backend returns
      if (data.user && data.user.role) {
        localStorage.setItem('user_role', data.user.role);
        if (data.user.role === 'public' || data.user.role === 'citizen' || data.user.role === 'user') {
          navigate('/user-dashboard');
        } else if (data.user.role === 'authority') {
          navigate('/authority-dashboard');
        } else if (data.user.role === 'admin') {
          navigate('/admin-dashboard');
        }
      }
      // ...handle other login logic...
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-red-500 mb-4">Login</h2>
        <select name="role" onChange={handleChange} className="w-full p-3 mb-4 rounded bg-gray-700 text-white">
          <option value="">Select Role</option>
          <option value="public">Citizen</option>
          <option value="authority">Authority</option>
          <option value="admin">Admin</option>
        </select>
        <input name="username" placeholder="Username" onChange={handleChange} className="w-full p-3 mb-4 rounded bg-gray-700 placeholder-gray-400" />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full p-3 mb-4 rounded bg-gray-700 placeholder-gray-400" />
        <button type="submit" className="w-full p-3 bg-red-600 hover:bg-red-700 rounded font-semibold">Login</button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {loading && <p className="text-gray-500 mt-4">Loading...</p>}
      </form>
    </div>
  );
}