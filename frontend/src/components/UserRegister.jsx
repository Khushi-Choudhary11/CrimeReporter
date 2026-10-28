import React, { useState } from "react";
import { authService } from '../services/api';

export default function UserRegister() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contact: "",
    address: "",
    username: "",
    password: ""
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
      await authService.registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        contact: formData.contact,
        address: formData.address
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
        <h2 className="text-2xl font-bold text-center text-red-500 mb-4">User Registration</h2>
        <input name="fullName" placeholder="Full Name" onChange={handleChange} className="w-full p-3 mb-4 rounded bg-gray-700 placeholder-gray-400" />
        <input name="email" placeholder="Email Address" type="email" onChange={handleChange} className="w-full p-3 mb-4 rounded bg-gray-700 placeholder-gray-400" />
        <input name="contact" placeholder="Contact Number" onChange={handleChange} className="w-full p-3 mb-4 rounded bg-gray-700 placeholder-gray-400" />
        <input name="address" placeholder="Address" onChange={handleChange} className="w-full p-3 mb-4 rounded bg-gray-700 placeholder-gray-400" />
        <input name="username" placeholder="Username" onChange={handleChange} className="w-full p-3 mb-4 rounded bg-gray-700 placeholder-gray-400" />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full p-3 mb-4 rounded bg-gray-700 placeholder-gray-400" />
        <button type="submit" className="w-full p-3 bg-red-600 hover:bg-red-700 rounded font-semibold">Register</button>
      </form>
    </div>
  );
}