import React, { useEffect, useState, useContext } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { MachineHome } from './MachineHome';
import { MachineRegister } from './MachineRegister';
import { MachineNotify } from './MachineNotify';

export const MachineDashWrapper = () => {
  const { apiFetch, token, role } = useContext(AppContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || role !== 'machine') {
      navigate('/home/auth/login');
      return;
    }
    
    if (window.location.pathname === '/home/machinedash' || window.location.pathname === '/home/machinedash/') {
      apiFetch("/machinedash")
        .then(res => {
          if (res.hasProfile) navigate('/home/machinedash/auth/home');
          else navigate('/home/machinedash/auth/register');
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [apiFetch, navigate, token, role]);

  if (loading) return <div className="text-white text-center mt-20 font-bold">Initializing Dashboard...</div>;

  return (
    <Routes>
      <Route path="auth/home" element={<MachineHome />} />
      <Route path="auth/register" element={<MachineRegister />} />
      <Route path="auth/notify" element={<MachineNotify />} />
    </Routes>
  );
};
