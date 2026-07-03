import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export const FarmerNotify = () => {
  const { apiFetch, refreshTrigger } = useContext(AppContext);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [notificationLogs, setNotificationLogs] = useState([]);

  useEffect(() => {
    apiFetch("/farmerdash/auth/notify")
      .then(res => {
        if (!res.error) {
          setPendingRequests(res.pendingRequests || []);
          setNotificationLogs(res.logs || []);
        }
      })
      .catch(() => toast.error("Failed to load notifications."));
  }, [refreshTrigger, apiFetch]);

  const respondRequest = async (requestId, decision) => {
    try {
      const res = await apiFetch(`/farmerdash/auth/assignment/${requestId}/respond`, { 
        method: 'POST', body: JSON.stringify({ decision }) 
      });
      if (res.error) toast.error(res.error);
      else toast.success(`Assignment ${decision}ed successfully.`);
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="space-y-8">
      <Link to="/home/farmerdash/auth/home" className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 transition font-bold text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="bg-white p-6 rounded-xl border border-green-200 shadow-sm">
        <h2 className="text-lg font-black text-green-900 mb-4 tracking-tight flex items-center gap-2 border-b border-green-100 pb-2">
          <AlertCircle className="text-green-600" /> Action Required: Pending Assignments
        </h2>
        <div className="space-y-4">
          {pendingRequests.map(r => (
            <div key={r.id} className="p-4 bg-green-50 rounded-lg border border-green-200 flex justify-between items-center">
              <div>
                <div className="font-bold text-green-900">Machine Unit: {r.machine_name}</div>
                <div className="text-sm text-green-700">Logistics Contact: {r.machine_phone}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => respondRequest(r.id, 'accept')} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-black rounded transition">Accept</button>
                <button onClick={() => respondRequest(r.id, 'reject')} className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold rounded transition">Reject</button>
              </div>
            </div>
          ))}
          {pendingRequests.length === 0 && <p className="text-green-600 text-sm py-2">No pending assignments requiring action.</p>}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-green-200 shadow-sm">
        <h2 className="text-lg font-black text-green-900 mb-4 tracking-tight border-b border-green-100 pb-2">Notification Logs</h2>
        <div className="space-y-3">
          {notificationLogs.map(log => (
            <div key={log.id} className="p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700">
              <span className="font-bold text-gray-900">{new Date(log.created_at).toLocaleDateString()}:</span> {log.message}
            </div>
          ))}
          {notificationLogs.length === 0 && <p className="text-green-600 text-sm">No notification logs available.</p>}
        </div>
      </div>
    </div>
  );
};
