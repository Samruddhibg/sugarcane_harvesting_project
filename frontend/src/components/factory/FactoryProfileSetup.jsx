import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

export const FactoryProfileSetup = () => {
  const { apiFetch, token, role, setAuth } = useContext(AppContext);
  const navigate = useNavigate();
  const [setupForm, setSetupForm] = useState({ name: '', district: '' });

  const createFactory = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch("/factorydash/create", { method: 'POST', body: JSON.stringify(setupForm) });
      if (res.error) return toast.error(res.error);
      
      setAuth(token, role, res.factoryId);
      toast.success("Factory cluster spawned successfully.");
      navigate('/home/factorydash/auth/home');
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="max-w-xl mx-auto bg-white border border-green-200 p-8 rounded-xl shadow-xl mt-10">
      <h2 className="text-2xl font-black text-green-950 tracking-tight mb-2">Initialize Factory Node</h2>
      <p className="text-green-700 text-sm mb-6">You must define your factory instance before accessing the dashboard.</p>
      <form onSubmit={createFactory} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-green-700 mb-1">Factory Name</label>
          <input type="text" value={setupForm.name} onChange={e => setSetupForm({...setupForm, name: e.target.value})} required className="w-full bg-green-50 border border-green-200 rounded px-3 py-2 text-green-900 outline-none focus:border-amber-500" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-green-700 mb-1">District</label>
          <select value={setupForm.district} onChange={e => setSetupForm({...setupForm, district: e.target.value})} required className="w-full bg-green-50 border border-green-200 rounded px-3 py-2 text-green-900 outline-none focus:border-green-500">
            <option value="">-- Choose District --</option>
            {['Kolhapur', 'Sangli', 'Satara', 'Pune', 'Solapur', 'Ahmednagar', 'Nashik', 'Jalgaon', 'Latur', 'Osmanabad'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded transition mt-4">
          Spawn Factory Cluster
        </button>
      </form>
    </div>
  );
};
