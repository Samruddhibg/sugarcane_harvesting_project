import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

export const FarmerProfileSetup = () => {
  const { apiFetch, setAuth, token, role } = useContext(AppContext);
  const navigate = useNavigate();
  const [baseIdentity, setBaseIdentity] = useState({});
  const [factories, setFactories] = useState([]);
  const [selectedFactories, setSelectedFactories] = useState([]);

  useEffect(() => {
    apiFetch("/farmerdash/auth/register").then(res => setBaseIdentity(res.baseIdentity));
    apiFetch("/home").then(res => setFactories(res.onlineFactories || []));
  }, [apiFetch]);

  const toggleFactory = (id) => {
    if (selectedFactories.includes(id)) {
      setSelectedFactories(selectedFactories.filter(f => f !== id));
    } else {
      setSelectedFactories([...selectedFactories, id]);
    }
  };

  const submitProfile = async (e) => {
    e.preventDefault();
    if (selectedFactories.length === 0) {
      return toast.error("Please select at least one factory.");
    }
    
    try {
      const res = await apiFetch("/farmerdash/profile", { 
        method: 'POST', 
        body: JSON.stringify({ factory_ids: selectedFactories }) 
      });
      if (res.error) return toast.error(res.error);
      
      toast.success("Profile created successfully!");
      // Re-fetch token to include factoryIds maybe, or just navigate
      // Wait, we can just navigate to dashboard and it will load.
      navigate('/home/farmerdash/auth/home');
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="max-w-xl mx-auto bg-white border border-green-200 p-8 rounded-xl shadow-xl mt-10">
      <h2 className="text-2xl font-black text-green-950 tracking-tight mb-2">Setup Farmer Profile</h2>
      <p className="text-green-700 text-sm mb-6">Select the factories you are affiliated with.</p>
      
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
          <label className="block text-xs font-bold uppercase tracking-wider text-green-700 mb-2">Select Factories (Multiple)</label>
          <select 
            multiple
            value={selectedFactories}
            onChange={(e) => {
              const options = Array.from(e.target.selectedOptions, option => parseInt(option.value, 10));
              setSelectedFactories(options);
            }}
            className="w-full bg-green-50 border border-green-200 rounded px-3 py-2 text-green-900 outline-none focus:border-green-500 h-32"
          >
            {factories.map(f => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.district})
              </option>
            ))}
          </select>
          <p className="text-xs text-green-600 mt-1">Hold Ctrl (or Cmd) to select multiple factories.</p>
        </div>
        
        <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded transition mt-4">
          Complete Profile Setup
        </button>
      </form>
    </div>
  );
};
