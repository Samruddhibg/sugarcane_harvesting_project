import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import { ArrowLeft, Radio } from 'lucide-react';

export const FactoryNotify = () => {
  const { apiFetch } = useContext(AppContext);
  const [broadcastMsg, setBroadcastMsg] = useState('');

  const sendBroadcast = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch("/factorydash/auth/notify", { method: 'POST', body: JSON.stringify({ message: broadcastMsg }) });
      if (res.error) return toast.error(res.error);
      
      toast.success(`Broadcast transmitted to ${res.targetedReceptors} connected nodes!`);
      setBroadcastMsg('');
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/factorydash/auth/home" className="inline-flex items-center gap-2 text-green-700 hover:text-white transition font-bold text-sm mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Factory Matrix
      </Link>

      <div className="bg-white p-8 rounded-xl border border-green-200 shadow-xl">
        <h2 className="text-2xl font-black text-green-950 tracking-tight flex items-center gap-2 mb-2">
          <Radio className="text-amber-500" /> Dispatch Notification
        </h2>
        <p className="text-green-700 text-sm mb-6">This message will be broadcasted to all farmers and machine users connected to this factory.</p>
        
        <form onSubmit={sendBroadcast} className="space-y-4">
          <textarea 
            placeholder="Type your alert/notification payload here..." 
            value={broadcastMsg} 
            onChange={e => setBroadcastMsg(e.target.value)} 
            required 
            className="w-full h-32 bg-green-50 border border-green-200 rounded p-4 text-green-900 focus:outline-none focus:border-amber-500 resize-none" 
          />
          <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 uppercase tracking-wider rounded transition flex items-center justify-center gap-2">
            <Radio className="h-4 w-4" /> Emit to Network
          </button>
        </form>
      </div>
    </div>
  );
};
