import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { PlusCircle, Bell, Clock, CheckCircle, Truck, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { downloadCSV } from '../../utils/csv';

export const FarmerHome = () => {
  const { apiFetch, refreshTrigger } = useContext(AppContext);
  const [data, setData] = useState({ requests: [], confirmed: [], crops: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch("/farmerdash/auth/home")
      .then(dash => {
        setData({
          requests: dash.requests || [],
          confirmed: dash.confirmed || [],
          crops: dash.crops || []
        });
      })
      .catch(err => toast.error("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, [refreshTrigger, apiFetch]);

  if (loading) return <div className="text-center mt-20 text-green-700 font-bold animate-pulse">Syncing Farm Data...</div>;

  const currentAssignments = data.confirmed.filter(c => c.status === 'assigned');
  const historyAssignments = data.confirmed.filter(c => c.status === 'finished');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-black text-green-900 tracking-tight">Dashboard History</h1>
      </div>

      {/* Pending Requests Section */}
      <section className="bg-white border border-amber-200 p-6 rounded-xl shadow-sm">
        <h3 className="font-bold text-amber-800 text-lg mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" /> Pending Machine Requests
        </h3>
        {data.requests.filter(r => r.status === 'pending').length === 0 ? (
          <p className="text-amber-600/70 text-sm italic">No pending requests at the moment.</p>
        ) : (
          <div className="space-y-3">
            {data.requests.filter(r => r.status === 'pending').map(req => (
              <div key={req.id} className="p-4 bg-amber-50 rounded-lg border border-amber-100 flex justify-between items-center">
                <div>
                  <div className="font-bold text-amber-900">Machine: {req.machine_name}</div>
                  <div className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Requested for Crop Reg #{req.f_register_id}
                  </div>
                </div>
                <div className="text-sm font-semibold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">Awaiting Response</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Current Assignments Section */}
      <section className="bg-white border border-blue-200 p-6 rounded-xl shadow-sm">
        <h3 className="font-bold text-blue-800 text-lg mb-4 flex items-center gap-2">
          <Truck className="h-5 w-5" /> Current Assignments
        </h3>
        {currentAssignments.length === 0 ? (
          <p className="text-blue-600/70 text-sm italic">No active harvesting machines currently assigned.</p>
        ) : (
          <div className="space-y-3">
            {currentAssignments.map(conf => (
              <div key={conf.id} className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-blue-900">{conf.machine_name} <span className="text-xs font-normal text-blue-600 ml-2">({conf.machine_phone})</span></div>
                  <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded">ACTIVE</span>
                </div>
                <div className="text-sm text-blue-800">Assigned to Crop Reg #{conf.f_register_id}</div>
                <div className="text-xs text-blue-500 mt-2">Started: {new Date(conf.assigned_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* History Section */}
      <section className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5" /> History (Finished Assignments)
          </h3>
          {historyAssignments.length > 0 && (
            <button onClick={() => downloadCSV(historyAssignments, 'farmer_history.csv')} className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded flex items-center gap-2 transition">
              <Download className="h-4 w-4" /> Export CSV
            </button>
          )}
        </div>
        {historyAssignments.length === 0 ? (
          <p className="text-gray-500/70 text-sm italic">No completed harvests yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3 font-bold">Confirmation ID</th>
                  <th className="px-4 py-3 font-bold">Machine Name</th>
                  <th className="px-4 py-3 font-bold">Machine Phone</th>
                  <th className="px-4 py-3 font-bold">Crop Reg #</th>
                  <th className="px-4 py-3 font-bold">Completed At</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {historyAssignments.map(conf => (
                  <tr key={conf.id} className="hover:bg-gray-50 opacity-80">
                    <td className="px-4 py-3 font-mono text-xs">#{conf.id}</td>
                    <td className="px-4 py-3 font-bold text-gray-800">{conf.machine_name}</td>
                    <td className="px-4 py-3 text-gray-600">{conf.machine_phone}</td>
                    <td className="px-4 py-3 text-gray-600">#{conf.f_register_id}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(conf.finished_at || conf.assigned_at).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-[10px] font-bold rounded uppercase">FINISHED</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
