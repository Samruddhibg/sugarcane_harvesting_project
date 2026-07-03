import React, { useEffect, useState, useContext } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { FarmerHome } from './FarmerHome';
import { FarmerNotify } from './FarmerNotify';
import { FarmerRegister } from './FarmerRegister';
import { FarmerProfile } from './FarmerProfile';
import { FarmerProfileSetup } from './FarmerProfileSetup';

export const FarmerDashWrapper = () => {
  const { apiFetch, token, role, logout } = useContext(AppContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || role !== 'farmer') {
      navigate('/home/auth/login');
      return;
    }
    
    // Check if the user is at the root of the dashboard
    if (window.location.pathname === '/home/farmerdash' || window.location.pathname === '/home/farmerdash/') {
      apiFetch("/farmerdash")
        .then(res => {
          if (res.hasProfile) navigate('/home/farmerdash/auth/home');
          else navigate('/home/farmerdash/auth/setup');
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [apiFetch, navigate, token, role]);

  if (loading) return <div className="text-green-900 text-center mt-20 font-bold">Initializing Dashboard...</div>;

  return (
    <div>
      <div className="flex justify-between items-center bg-white p-4 mb-6 rounded-xl border border-green-200 shadow-sm overflow-x-auto">
        <h2 className="font-black text-green-700 text-xl tracking-tight mr-4">Farmer Portal</h2>
        <div className="flex gap-2 sm:gap-4 shrink-0">
          <Link to="/home/farmerdash/auth/register" className="px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-sm rounded transition">Register Crop</Link>
          <Link to="/home/farmerdash/profile" className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-800 font-bold text-sm rounded transition">Profile</Link>
        </div>
      </div>

      <Routes>
        <Route path="auth/home" element={<FarmerHome />} />
        <Route path="notify" element={<FarmerNotify />} />
        <Route path="auth/register" element={<FarmerRegister />} />
        <Route path="auth/setup" element={<FarmerProfileSetup />} />
        <Route path="profile" element={<FarmerProfile />} />
      </Routes>
    </div>
  );
};
