import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import { Radio, Download } from 'lucide-react';
import { downloadCSV } from '../../utils/csv';

export const FactoryHome = () => {
  const { apiFetch, refreshTrigger } = useContext(AppContext);
  const [accounts, setAccounts] = useState({ farmers: [], machines: [] });
  const [intake, setIntake] = useState({ fRegistrations: [], mRegistrations: [] });
  const [matchingFlows, setMatchingFlows] = useState({ activeRequests: [], liveAssignments: [] });

  useEffect(() => {
    apiFetch("/factorydash/auth/home")
      .then(data => {
        setAccounts(data.accounts || { farmers: [], machines: [] });
        setIntake(data.intake || { fRegistrations: [], mRegistrations: [] });
        setMatchingFlows(data.matchingFlows || { activeRequests: [], liveAssignments: [] });
      })
      .catch(err => toast.error("Failed to load factory data."));
  }, [refreshTrigger, apiFetch]);

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-green-200">
        <div>
          <div className="text-xs text-green-600 uppercase tracking-widest font-bold">Factory Administration</div>
          <h1 className="text-2xl font-black text-green-950 tracking-tight">System Control Matrix</h1>
        </div>
        <Link to="/home/factorydash/notify" className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded flex items-center gap-2 transition">
          <Radio className="h-4 w-4" /> Broadcast Notification
        </Link>
      </div>

      <div className="space-y-8">
        {/* TABLE 1: Registered Machines */}
        <section className="bg-white p-6 rounded-xl border border-green-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-black text-amber-600 uppercase tracking-wider">1. Registered Machines</h2>
            {accounts.machines.length > 0 && (
              <button onClick={() => downloadCSV(accounts.machines, 'factory_machines.csv')} className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-800 text-xs font-bold rounded flex items-center gap-2 transition">
                <Download className="h-4 w-4" /> Export CSV
              </button>
            )}
          </div>
          <div className="overflow-x-auto rounded-lg border border-green-200">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-green-50 text-green-800">
                <tr>
                  <th className="px-4 py-3 font-bold">Machine ID</th>
                  <th className="px-4 py-3 font-bold">Name</th>
                  <th className="px-4 py-3 font-bold">Phone</th>
                  <th className="px-4 py-3 font-bold">District</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-100 bg-white">
                {accounts.machines.map(m => (
                  <tr key={m.id} className="hover:bg-green-50/50">
                    <td className="px-4 py-3 font-mono text-xs text-green-700">#{m.id}</td>
                    <td className="px-4 py-3 font-bold text-gray-800">{m.name}</td>
                    <td className="px-4 py-3 text-gray-600">{m.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{m.district}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${m.status === 'idle' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{m.status}</span>
                    </td>
                  </tr>
                ))}
                {accounts.machines.length === 0 && (
                  <tr><td colSpan="5" className="py-4 px-4 text-xs text-gray-500 italic">No machines registered.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* TABLE 2: Farmer Details */}
        <section className="bg-white p-6 rounded-xl border border-green-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-black text-amber-600 uppercase tracking-wider">2. Farmer Details</h2>
            {accounts.farmers.length > 0 && (
              <button onClick={() => downloadCSV(accounts.farmers, 'factory_farmers.csv')} className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-800 text-xs font-bold rounded flex items-center gap-2 transition">
                <Download className="h-4 w-4" /> Export CSV
              </button>
            )}
          </div>
          <div className="overflow-x-auto rounded-lg border border-green-200">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-green-50 text-green-800">
                <tr>
                  <th className="px-4 py-3 font-bold">Farmer ID</th>
                  <th className="px-4 py-3 font-bold">Name</th>
                  <th className="px-4 py-3 font-bold">Phone</th>
                  <th className="px-4 py-3 font-bold">District</th>
                  <th className="px-4 py-3 font-bold">Joined At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-100 bg-white">
                {accounts.farmers.map(f => (
                  <tr key={f.id} className="hover:bg-green-50/50">
                    <td className="px-4 py-3 font-mono text-xs text-green-700">#{f.id}</td>
                    <td className="px-4 py-3 font-bold text-gray-800">{f.name}</td>
                    <td className="px-4 py-3 text-gray-600">{f.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{f.district}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(f.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {accounts.farmers.length === 0 && (
                  <tr><td colSpan="5" className="py-4 px-4 text-xs text-gray-500 italic">No farmers registered.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* TABLE 3: Confirmed Assignments */}
        <section className="bg-white p-6 rounded-xl border border-green-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-black text-amber-600 uppercase tracking-wider">3. Confirmed Assignments</h2>
            {matchingFlows.liveAssignments.length > 0 && (
              <button onClick={() => downloadCSV(matchingFlows.liveAssignments, 'factory_assignments.csv')} className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-800 text-xs font-bold rounded flex items-center gap-2 transition">
                <Download className="h-4 w-4" /> Export CSV
              </button>
            )}
          </div>
          <div className="overflow-x-auto rounded-lg border border-green-200">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-green-50 text-green-800">
                <tr>
                  <th className="px-4 py-3 font-bold">ID</th>
                  <th className="px-4 py-3 font-bold">Farmer Name</th>
                  <th className="px-4 py-3 font-bold">Farmer Phone</th>
                  <th className="px-4 py-3 font-bold">Machine Name</th>
                  <th className="px-4 py-3 font-bold">Machine Phone</th>
                  <th className="px-4 py-3 font-bold">Crop Size (Ha)</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-100 bg-white">
                {matchingFlows.liveAssignments.map(a => (
                  <tr key={a.id} className="hover:bg-green-50/50">
                    <td className="px-4 py-3 font-mono text-xs text-green-700">#{a.id}</td>
                    <td className="px-4 py-3 font-bold text-gray-800">{a.farmer_name}</td>
                    <td className="px-4 py-3 text-gray-600">{a.farmer_phone}</td>
                    <td className="px-4 py-3 font-bold text-gray-800">{a.machine_name}</td>
                    <td className="px-4 py-3 text-gray-600">{a.machine_phone}</td>
                    <td className="px-4 py-3 text-gray-600">{a.crop_size}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">{a.status}</span>
                    </td>
                  </tr>
                ))}
                {matchingFlows.liveAssignments.length === 0 && (
                  <tr><td colSpan="7" className="py-4 px-4 text-xs text-gray-500 italic">No confirmed assignments.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};
