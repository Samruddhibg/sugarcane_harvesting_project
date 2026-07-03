import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Layers, LogOut } from 'lucide-react';

export const Navbar = () => {
  const { token, role, userProfile, logout } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  return (
    <nav className="bg-white border-b border-green-200 px-6 py-4 flex justify-between items-center shadow-lg">
      <Link to="/home" className="flex items-center gap-3 cursor-pointer">
        <div className="h-8 w-8 rounded bg-green-600 flex items-center justify-center font-black text-white">
          <Layers className="h-4 w-4" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white hover:text-green-400 transition">Sugarcane Resource Engine</span>
      </Link>
      
      {token && userProfile ? (
        <div className="flex items-center gap-4">
          <span className="text-sm text-green-400 font-medium hidden sm:inline">{userProfile.name} ({role.toUpperCase()})</span>
          {role === 'farmer' && (
            <Link to="/home/farmerdash/notify" className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded transition">
              Notifications
            </Link>
          )}
          <Link to={`/home/${role === 'factory admin' ? 'factorydash' : `${role}dash`}`} className="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-500 text-white font-semibold rounded transition">
            Dashboard
          </Link>
          <button onClick={handleLogout} className="px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded flex items-center gap-1.5 transition">
            <LogOut className="h-3 w-3" /> Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link to="/home/auth/signup" className="text-sm font-semibold text-green-800 hover:text-white transition">Signup</Link>
          <Link to="/home/auth/login" className="px-4 py-1.5 text-sm bg-green-600 hover:bg-green-500 text-white font-bold rounded transition">Login</Link>
        </div>
      )}
    </nav>
  );
};