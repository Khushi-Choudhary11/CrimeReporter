import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";


export default function Sidebar() {
  const [role, setRole] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem('user_role');
    setRole(storedRole);
  }, []);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    setRole(null);
    navigate('/login');
  };

  const NavLinks = () => (
    <>
      {(role === 'user' || role === 'public' || role === 'citizen') && (
        <>
          <Link to="/user-dashboard" className="nav-link">User Dashboard</Link>
          <Link to="/nearby-crimes" className="nav-link">Nearby Crimes</Link>
          <Link to="/report-crime" className="nav-link">Report Crime</Link>
          <Link to="/my-crime-history" className="nav-link">My Crime History</Link>
          <Link to="/chat-authority" className="nav-link">Chat with Authority</Link>
        </>
      )}

      {role === "authority" && (
        <>

          <Link to="/chat-affected" className="nav-link">Chat with Affected</Link>
          <Link to="/authority-dashboard" className="nav-link"> Authority Dashboard</Link>
          <Link to="/authority/assigned-complaints" className="nav-link">Assigned Complaints</Link>
        </>
      )}

      {role === "admin" && (
        <>
          <Link to="/all-users" className="nav-link">View Users</Link>
          <Link to="/active-crime-areas" className="nav-link">Active Crime Areas</Link>
          <Link to="/crime-analysis" className="nav-link">Crime Analysis</Link>
          <Link to="/admin-dashboard" className="nav-link">Admin Dashboard</Link>
        </>
      )}

      {!role && (
        <>
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/register/user" className="nav-link">User Register</Link>
          <Link to="/register/authority" className="nav-link">Authority Register</Link>
        </>
      )}

      {role && (
        <li>
          <button onClick={handleLogout} className="block py-2 px-4 w-full text-left hover:bg-gray-700 rounded">Logout</button>
        </li>
      )}
    </>
  );

  return (
    <>
      {/* Mobile Navigation */}
      <div className="md:hidden bg-gray-900 text-white p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-red-500">Crime Portal</h2>
          <button 
            onClick={toggleMenu} 
            className="text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
        
        {isMenuOpen && (
          <div className="mt-4 space-y-2">
            <NavLinks />
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block min-h-screen w-64 bg-gray-900 text-white p-5 space-y-4 shadow-lg">
        <h2 className="text-2xl font-bold text-red-500 mb-6">Crime Portal</h2>
        <NavLinks />
      </div>
    </>
  );
}