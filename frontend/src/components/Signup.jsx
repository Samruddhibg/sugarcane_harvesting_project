import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserPlus } from 'lucide-react';
import { BACKEND_URL } from '../context/AppContext';

export const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', phone: '', password: '', district: '', role: 'farmer' });

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/home/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("succes signed in");
        navigate('/home/auth/login');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white border border-green-200 p-8 rounded-xl shadow-2xl">
      <div className="text-center mb-8">
        <div className="mx-auto h-12 w-12 bg-green-600 rounded-full flex items-center justify-center mb-4">
          <UserPlus className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl font-black text-green-950 tracking-tight">Create Account</h2>
        <p className="text-green-700 mt-2 text-sm">Join the platform to manage your resources.</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-green-700 mb-1">Name</label>
          <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full bg-green-50 border border-green-200 rounded px-4 py-2 text-green-900 focus:border-green-500 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-green-700 mb-1">Phone Number</label>
          <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required className="w-full bg-green-50 border border-green-200 rounded px-4 py-2 text-green-900 focus:border-green-500 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-green-700 mb-1">Password</label>
          <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required className="w-full bg-green-50 border border-green-200 rounded px-4 py-2 text-green-900 focus:border-green-500 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-green-700 mb-1">District</label>
          <select value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} required className="w-full bg-green-50 border border-green-200 rounded px-4 py-2 text-green-900 focus:border-green-500 outline-none">
            <option value="">-- Choose District --</option>
            {['Kolhapur', 'Sangli', 'Satara', 'Pune', 'Solapur', 'Ahmednagar', 'Nashik', 'Jalgaon', 'Latur', 'Osmanabad'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-green-700 mb-1">Role</label>
          <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-green-50 border border-green-200 rounded px-4 py-2 text-green-900 focus:border-green-500 outline-none">
            <option value="farmer">Farmer</option>
            <option value="machine">Machine</option>
            <option value="factory admin">Factory Admin</option>
          </select>
        </div>
        <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded transition mt-4">
          Sign Up
        </button>
      </form>
      <div className="mt-6 text-center text-sm text-green-700">
        Already have an account? <Link to="/home/auth/login" className="text-green-400 hover:text-green-300 font-bold">Log in</Link>
      </div>
    </div>
  );
};
