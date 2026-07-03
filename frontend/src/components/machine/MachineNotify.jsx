import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import { ArrowLeft, MessageSquare } from 'lucide-react';

export const MachineNotify = () => {
  const { apiFetch, refreshTrigger } = useContext(AppContext);
  const [notificationLogs, setNotificationLogs] = useState([]);

  useEffect(() => {
    apiFetch("/machinedash/auth/notify")
      .then(res => setNotificationLogs(res.logs || []))
      .catch(err => toast.error("Failed to load notifications."));
  }, [refreshTrigger, apiFetch]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/home/machinedash/auth/home" className="inline-flex items-center gap-2 text-green-700 hover:text-white transition font-bold text-sm mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="bg-white p-6 rounded-xl border border-green-200">
        <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
          <MessageSquare className="text-emerald-400 h-5 w-5" /> Notifications
        </h2>
        <div className="space-y-4">
          {notificationLogs.map(n => (
            <div key={n.id} className="p-4 bg-green-50 rounded-lg border border-green-200/80">
              <div className="text-gray-200 leading-relaxed text-sm">{n.message}</div>
              <div className="text-emerald-500 font-mono text-[10px] mt-2 font-bold uppercase">{new Date(n.created_at).toLocaleString()}</div>
            </div>
          ))}
          {notificationLogs.length === 0 && <p className="text-green-600 text-sm">No new notifications.</p>}
        </div>
      </div>
    </div>
  );
};
