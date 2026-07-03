import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

export const FarmerProfile = () => {
  const { apiFetch } = useContext(AppContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/farmerdash/profile")
      .then(res => {
        if (res.error) toast.error(res.error);
        else setProfile(res.profile);
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [apiFetch]);

  if (loading) return <div className="text-center text-green-700">Loading profile...</div>;
  if (!profile) return <div className="text-center text-red-500">Profile data missing.</div>;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link to="/home/farmerdash/auth/home" className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 transition font-bold text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>
      
      <div className="bg-white p-8 rounded-xl border border-green-200 shadow-sm">
        <h2 className="text-2xl font-black text-green-900 tracking-tight mb-6">Profile Details</h2>
        <div className="space-y-4">
          <div className="flex justify-between border-b border-green-100 pb-2">
            <span className="font-bold text-green-600 uppercase">Profile ID</span>
            <span className="text-green-900">{profile.id}</span>
          </div>
          <div className="flex justify-between border-b border-green-100 pb-2">
            <span className="font-bold text-green-600 uppercase">Name</span>
            <span className="text-green-900">{profile.name}</span>
          </div>
          <div className="flex justify-between border-b border-green-100 pb-2">
            <span className="font-bold text-green-600 uppercase">Phone</span>
            <span className="text-green-900">{profile.phone}</span>
          </div>
          <div className="flex justify-between border-b border-green-100 pb-2">
            <span className="font-bold text-green-600 uppercase">District</span>
            <span className="text-green-900">{profile.district}</span>
          </div>
          <div className="flex justify-between border-b border-green-100 pb-2">
            <span className="font-bold text-green-600 uppercase">Assigned Factory ID</span>
            <span className="text-green-900">{profile.factory_id || 'Unassigned'}</span>
          </div>
          <div className="flex justify-between pb-2">
            <span className="font-bold text-green-600 uppercase">Registered Date</span>
            <span className="text-green-900">{new Date(profile.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
