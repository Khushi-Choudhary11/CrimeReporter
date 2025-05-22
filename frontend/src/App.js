import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import { crimeService, userService, chatService } from "./services/api";


// User components
import UserRegister from './components/UserRegister';
import AuthorityRegister from './components/AuthorityRegister';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import UserDashboard from './pages/UserDashboard';
import NearbyCrimes from './pages/NearbyCrimes';
import ReportCrime from './pages/ReportCrime';
import MyCrimeHistory from './pages/MyCrimeHistory';


// Authority components
import AuthorityDashboard from './pages/AuthorityDashboard';
import AreaCrimes from './pages/AreaCrimes';
import ActiveUsers from './pages/ActiveUsers';
import CrimeDashboard from './pages/authority/CrimeDashboard';
import AssignedComplaints from './pages/authority/AssignedComplaints';

// Admin components
import AdminDashboard from './pages/admin/AdminDashboard';
import AllUsers from './pages/admin/AllUsers';
import ActiveCrimeAreas from './pages/admin/ActiveCrimeAreas';
import CrimeAnalysis from './pages/admin/CrimeAnalysis';

// Import chat components
import ChatAuthority from './pages/ChatAuthority';
import ChatAffected from './pages/ChatAffected';

function App() {
  const [userRole, setUserRole] = useState(null); // This would be set after login

  // Mock login function placeholder (can be implemented if needed in the future)

  return (
    <Router>
      <div className="flex flex-col md:flex-row min-h-screen">
        <Sidebar role={userRole} />
        
        <div className="flex-1 bg-gray-100">
          {/* Main content area */}
          <main className="container mx-auto p-4">
            <Routes>
              {/* Common routes */}
              <Route path="/" element={
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Crime Detector</h2>
                  <p className="text-gray-600 mb-4">
                    Our advanced AI system helps detect and analyze criminal activities using machine learning algorithms.
                  </p>
                  <Link to="/register" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                    Get Started
                  </Link>
                </div>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Register</h2>
                  <div className="flex flex-col md:flex-row justify-center gap-4">
                    <Link to="/register/user" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-center">
                      Register as User
                    </Link>
                    <Link to="/register/authority" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-center">
                      Register as Authority
                    </Link>
                  </div>
                </div>
              } />
              <Route path="/register/user" element={<UserRegister />} />
              <Route path="/register/authority" element={<AuthorityRegister />} />
              
              {/* User routes */}
              <Route path="/user-dashboard" element={<UserDashboard />} />
              <Route path="/nearby-crimes" element={<NearbyCrimes />} />
              <Route path="/report-crime" element={<ReportCrime />} />
              <Route path="/my-crime-history" element={<MyCrimeHistory />} />
              
              {/* Authority routes */}
              <Route path="/authority-dashboard" element={<AuthorityDashboard />} />
              <Route path="/area-crimes" element={<AreaCrimes />} />
              <Route path="/active-users" element={<ActiveUsers />} />  
              <Route path="/crime-dashboard" element={<CrimeDashboard />} />
              <Route path="/crime-dashboard/:pincode" element={<CrimeDashboard />} />
              <Route path="/authority/assigned-complaints" element={<AssignedComplaints />} />

              
              {/* Admin routes */}

              {/* Admin routes */}
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/all-users" element={<AllUsers />} />
              <Route path="/active-crime-areas" element={<ActiveCrimeAreas />} />
              <Route path="/crime-analysis" element={<CrimeAnalysis />} />

              {/* Chat routes */}
              <Route path="/chat-authority" element={<ChatAuthority />} />
              <Route path="/chat-affected" element={<ChatAffected />} />
            </Routes>
          </main>
          
          <footer className="bg-gray-800 text-white p-4 mt-8">
            <div className="container mx-auto text-center">
              <p>&copy; {new Date().getFullYear()} Crime Detector. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </div>
    </Router>
  );
}

export default App;
