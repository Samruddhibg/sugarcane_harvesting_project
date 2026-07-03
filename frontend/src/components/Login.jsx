import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { LogIn } from 'lucide-react';
import { BACKEND_URL } from '../context/AppContext';

export const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useContext(AppContext);
  const [formData, setFormData] = useState({ phone: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/home/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.error) {
        toast.error(data.error);
      } else {
        setAuth(data.role, data.factoryId, data.userProfile, data.token);
        toast.success("successfully logined");
        
        if (data.role === 'farmer') navigate('/home/farmerdash');
        else if (data.role === 'machine') navigate('/home/machinedash');
        else if (data.role === 'factory admin') navigate('/home/factorydash');
        else navigate('/home');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white border border-green-200 p-8 rounded-xl shadow-2xl">
      <div className="text-center mb-8">
        <div className="mx-auto h-12 w-12 bg-emerald-600 rounded-full flex items-center justify-center mb-4">
          <LogIn className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl font-black text-green-950 tracking-tight">Login Securely</h2>
        <p className="text-green-700 mt-2 text-sm">Access your dedicated dashboard.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-green-700 mb-1">Phone Number</label>
          <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required className="w-full bg-green-50 border border-green-200 rounded px-4 py-2 text-green-900 focus:border-emerald-500 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-green-700 mb-1">Password</label>
          <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required className="w-full bg-green-50 border border-green-200 rounded px-4 py-2 text-green-900 focus:border-emerald-500 outline-none" />
        </div>
        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded transition mt-4">
          Login to Dashboard
        </button>
      </form>
      <div className="mt-6 text-center text-sm text-green-700">
        Don't have an account? <Link to="/home/auth/signup" className="text-emerald-400 hover:text-emerald-300 font-bold">Sign up</Link>
      </div>
    </div>
  );
};
