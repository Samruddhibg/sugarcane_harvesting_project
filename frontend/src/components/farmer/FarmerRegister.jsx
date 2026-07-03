import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

export const FarmerRegister = () => {
  const { apiFetch, setAuth, token, role } = useContext(AppContext);
  const navigate = useNavigate();
  const [baseIdentity, setBaseIdentity] = useState({});
  const [factories, setFactories] = useState([]);
  const [profileForm, setProfileForm] = useState({ factory_id: '', address: '', planting_date: '', crop_size: '' });

  useEffect(() => {
    // Auto-fill logic as per requirements
    apiFetch("/farmerdash/auth/register").then(res => setBaseIdentity(res.baseIdentity));
    
    Promise.all([
      apiFetch("/home"),
      apiFetch("/farmerdash/profile")
    ]).then(([homeRes, profRes]) => {
      const allFactories = homeRes.onlineFactories || [];
      const assignedIds = profRes.profile?.factory_ids || [];
      const available = allFactories.filter(f => assignedIds.includes(f.id));
      setFactories(available);
      
      if (available.length === 1) {
        setProfileForm(prev => ({ ...prev, factory_id: available[0].id }));
      }
    }).catch(console.error);
  }, [apiFetch]);

  const submitProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch("/farmerdash/auth/register", { method: 'POST', body: JSON.stringify(profileForm) });
      if (res.error) return toast.error(res.error);
      
      toast.success("Registration successful and stored in f_register!");
      setAuth(token, role, profileForm.factory_id);
      navigate('/home/farmerdash/auth/home');
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="max-w-xl mx-auto bg-white border border-green-200 p-8 rounded-xl shadow-xl mt-10">
      <h2 className="text-2xl font-black text-green-950 tracking-tight mb-2">Crop Registration Form</h2>
      <p className="text-green-700 text-sm mb-6">Auto-filled with user data from the user table.</p>
      
      <div className="space-y-3 my-6 p-5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
        <div className="flex justify-between border-b border-green-200 pb-2">
          <span className="font-bold text-green-600 uppercase">Identity Name</span>
          <span className="font-mono text-green-400">{baseIdentity.name || 'Loading...'}</span>
        </div>
        <div className="flex justify-between border-b border-green-200 pb-2">
          <span className="font-bold text-green-600 uppercase">Phone</span>
          <span className="font-mono text-green-400">{baseIdentity.phone || 'Loading...'}</span>
        </div>
        <div className="flex justify-between pb-1">
          <span className="font-bold text-green-600 uppercase">District</span>
          <span className="font-mono text-green-400">{baseIdentity.district || 'Loading...'}</span>
        </div>
      </div>

      <form onSubmit={submitProfile} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-green-700 mb-1">Select Factory</label>
          <select value={profileForm.factory_id} onChange={e => setProfileForm({...profileForm, factory_id: e.target.value})} required className="w-full bg-green-50 border border-green-200 rounded px-3 py-2 text-green-900 outline-none focus:border-green-500">
            <option value="">-- Choose Factory Option --</option>
            {factories.map(f => <option key={f.id} value={f.id}>{f.name} ({f.district})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-green-700 mb-1">Address</label>
          <textarea placeholder="Specific Address" onChange={e => setProfileForm({...profileForm, address: e.target.value})} required className="w-full bg-green-50 border border-green-200 rounded px-3 py-2 text-white h-24 outline-none focus:border-green-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-green-700 mb-1">Planting Date</label>
            <input type="date" onChange={e => setProfileForm({...profileForm, planting_date: e.target.value})} required className="w-full bg-green-50 border border-green-200 rounded px-3 py-2 text-green-900 outline-none focus:border-green-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-green-700 mb-1">Crop Size (Hectares)</label>
            <input type="number" placeholder="Size" step="0.01" onChange={e => setProfileForm({...profileForm, crop_size: e.target.value})} required className="w-full bg-green-50 border border-green-200 rounded px-3 py-2 text-green-900 outline-none focus:border-green-500" />
          </div>
        </div>
        <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded transition mt-4">
          Submit to f_register
        </button>
      </form>
    </div>
  );
};
