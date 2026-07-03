import React, { useEffect, useState, useContext } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { FactoryHome } from './FactoryHome';
import { FactoryNotify } from './FactoryNotify';
import { FactoryProfileSetup } from './FactoryProfileSetup';

export const FactoryDashWrapper = () => {
  const { token, role, factoryId, logout } = useContext(AppContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || role !== 'factory admin') {
      navigate('/home/auth/login');
      return;
    }
    
    if (window.location.pathname === '/home/factorydash' || window.location.pathname === '/home/factorydash/') {
      if (factoryId) {
        navigate('/home/factorydash/auth/home');
      } else {
        navigate('/home/factorydash/auth/setup');
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [navigate, token, role, factoryId]);

  if (loading) return <div className="text-white text-center mt-20 font-bold">Initializing Dashboard...</div>;

  return (
    <div>
      <div className="flex justify-between items-center bg-white p-4 mb-6 rounded-xl border border-amber-200 shadow-sm overflow-x-auto">
        <h2 className="font-black text-amber-700 text-xl tracking-tight mr-4">Factory Admin Portal</h2>
        <div className="flex gap-2 sm:gap-4 shrink-0">
          <Link to="/home/factorydash/notify" className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-sm rounded transition">Notifications</Link>
          <button onClick={() => { logout(); navigate('/home'); }} className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 font-bold text-sm rounded transition">Logout</button>
        </div>
      </div>

      <Routes>
        <Route path="auth/home" element={<FactoryHome />} />
        <Route path="notify" element={<FactoryNotify />} />
        <Route path="auth/setup" element={<FactoryProfileSetup />} />
      </Routes>
    </div>
  );
};
