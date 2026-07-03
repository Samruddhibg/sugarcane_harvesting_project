import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

export const MachineRegister = () => {
  const { apiFetch, setAuth, token, role, userProfile } = useContext(AppContext);
  const navigate = useNavigate();
  const [factories, setFactories] = useState([]);
  const [selectedFactory, setSelectedFactory] = useState('');

  useEffect(() => {
    apiFetch("/home").then(res => {
      const allFactories = res.onlineFactories || [];
      setFactories(allFactories);
      if (allFactories.length === 1) {
        setSelectedFactory(allFactories[0].id);
      }
    });
  }, [apiFetch]);

  const submitRegistration = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch("/machinedash/auth/register", { method: 'POST', body: JSON.stringify({ factory_id: selectedFactory }) });
      if (res.error) return toast.error(res.error);
      
      setAuth(token, role, selectedFactory);
      toast.success("Machine Unit Registered Successfully");
      navigate('/home/machinedash/auth/home');
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="max-w-xl mx-auto bg-white border border-green-200 p-8 rounded-xl shadow-xl mt-10">
      <h2 className="text-2xl font-black text-green-950 tracking-tight mb-2">Machine Registration Form</h2>
      <p className="text-green-700 text-sm mb-6">Auto-filled data from user table.</p>
      
      <div className="space-y-3 my-6 p-5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
        <div className="flex justify-between border-b border-green-200 pb-2">
          <span className="font-bold text-green-600 uppercase">Operator Name</span>
          <span className="font-mono text-emerald-400">{userProfile?.name}</span>
        </div>
        <div className="flex justify-between border-b border-green-200 pb-2">
          <span className="font-bold text-green-600 uppercase">Phone</span>
          <span className="font-mono text-emerald-400">{userProfile?.phone}</span>
        </div>
        <div className="flex justify-between pb-1">
          <span className="font-bold text-green-600 uppercase">District</span>
          <span className="font-mono text-emerald-400">{userProfile?.district}</span>
        </div>
      </div>

      <form onSubmit={submitRegistration} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-green-700 mb-1">Select Factory Option</label>
          <select value={selectedFactory} onChange={e => setSelectedFactory(e.target.value)} required className="w-full bg-green-50 border border-green-200 rounded px-3 py-2 text-green-900 outline-none focus:border-emerald-500">
            <option value="">-- Choose Factory --</option>
            {factories.map(f => <option key={f.id} value={f.id}>{f.name} ({f.district})</option>)}
          </select>
        </div>
        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded transition mt-4">
          Submit to m_register
        </button>
      </form>
    </div>
  );
};
