import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import { Bell, Download } from 'lucide-react';
import { downloadCSV } from '../../utils/csv';

export const MachineHome = () => {
  const { apiFetch, refreshTrigger, logout } = useContext(AppContext);
  const navigate = useNavigate();
  const [baseProfile, setBaseProfile] = useState({});
  const [allocations, setAllocations] = useState([]);

  useEffect(() => {
    apiFetch("/machinedash/auth/home")
      .then(dash => {
        setBaseProfile(dash.profile || {});
        setAllocations(dash.allocations || []);
      })
      .catch(err => toast.error("Failed to load dashboard data."));
  }, [refreshTrigger, apiFetch]);

  const toggleStatus = async () => {
    try {
      const res = await apiFetch("/machinedash/auth/toggle-status", { method: 'POST' });
      if (res.error) return toast.error(res.error);
      
      setBaseProfile({ ...baseProfile, status: res.status });
      
      // Refetch allocations so UI updates immediately
      const dash = await apiFetch("/machinedash/auth/home");
      setAllocations(dash.allocations || []);

      toast.success(`Machine status updated to ${res.status.toUpperCase()}`);
    } catch (err) { toast.error(err.message); }
  };

  const deactivateAccount = async () => {
    if (!window.confirm("Execute asset isolation routine to remove machine metadata parameters?")) return;
    try {
      await apiFetch("/machinedash/auth/deactivate", { method: 'POST' });
      logout();
      navigate('/home');
      toast.success("Machine data deleted permanently from all dashes.");
    } catch (err) { toast.error(err.message); }
  };

  const currentAssignments = allocations.filter(a => a.status === 'assigned');
  const historyAssignments = allocations.filter(a => a.status === 'finished');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-green-200">
        <div>
          <div className="text-xs text-green-600 uppercase font-mono tracking-wider">Node Ref: ASSET-{baseProfile.id}</div>
          <h1 className="text-2xl font-black text-green-950 tracking-tight">Machine Operator Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleStatus} 
            className={`px-4 py-2 font-black text-xs uppercase rounded flex items-center gap-2 transition ${baseProfile.status === 'idle' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-amber-600 hover:bg-amber-500 text-white'}`}
          >
            {baseProfile.status === 'idle' ? 'Status: IDLE' : 'Status: BUSY'}
          </button>
          <Link to="/home/machinedash/auth/notify" className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded flex items-center gap-2 transition">
            <Bell className="h-4 w-4" /> View Notifications
          </Link>
          <button onClick={deactivateAccount} className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 text-rose-300 text-xs font-bold rounded transition">Deactivate Asset</button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-blue-200">
        <h2 className="text-lg font-black text-blue-900 tracking-tight mb-4">Current Assignment</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 font-bold">Confirmation ID</th>
                <th className="px-4 py-3 font-bold">Farmer Name</th>
                <th className="px-4 py-3 font-bold">Farmer Phone</th>
                <th className="px-4 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {currentAssignments.map(a => (
                <tr key={a.id} className="hover:bg-gray-50 opacity-90">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">#{a.id}</td>
                  <td className="px-4 py-3 font-bold text-gray-800">{a.farmer_name}</td>
                  <td className="px-4 py-3 text-gray-600">{a.farmer_phone}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 font-bold uppercase">{a.status}</span>
                  </td>
                </tr>
              ))}
              {currentAssignments.length === 0 && (
                <tr><td colSpan="4" className="py-4 px-4 text-xs text-gray-500 italic">No active assignment.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-black text-gray-900 tracking-tight">Assignment History</h2>
          {historyAssignments.length > 0 && (
            <button onClick={() => downloadCSV(historyAssignments, 'machine_history.csv')} className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded flex items-center gap-2 transition">
              <Download className="h-4 w-4" /> Export CSV
            </button>
          )}
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 font-bold">Confirmation ID</th>
                <th className="px-4 py-3 font-bold">Farmer Name</th>
                <th className="px-4 py-3 font-bold">Farmer Phone</th>
                <th className="px-4 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {historyAssignments.map(a => (
                <tr key={a.id} className="hover:bg-gray-50 opacity-80">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">#{a.id}</td>
                  <td className="px-4 py-3 font-bold text-gray-800">{a.farmer_name}</td>
                  <td className="px-4 py-3 text-gray-600">{a.farmer_phone}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-gray-200 text-gray-700 font-bold uppercase">{a.status}</span>
                  </td>
                </tr>
              ))}
              {historyAssignments.length === 0 && (
                <tr><td colSpan="4" className="py-4 px-4 text-xs text-gray-500 italic">No assignment history found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
