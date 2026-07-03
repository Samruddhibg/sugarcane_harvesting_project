import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Send, MapPin, Phone, User, Settings, Info } from 'lucide-react';

export const Home = () => {
  const [enquiry, setEnquiry] = useState({ name: '', phone: '', district: '', role: 'farmer', msg: '' });

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5001/home/feedback", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enquiry)
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Enquiry sent successfully!");
        setEnquiry({ name: '', phone: '', district: '', role: 'farmer', msg: '' });
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-12">
      {/* Grid shaped info about what we do */}
      <section>
        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
          <Settings className="text-green-500" /> What We Do
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-green-200 p-6 rounded-xl hover:border-green-500 transition-colors">
            <h3 className="text-xl font-bold text-green-400 mb-3">Farmer Resource Allocation</h3>
            <p className="text-green-700">Streamlining the process of harvesting sugarcane by automatically matching farmer's crop maturity with available machinery.</p>
          </div>
          <div className="bg-white border border-green-200 p-6 rounded-xl hover:border-emerald-500 transition-colors">
            <h3 className="text-xl font-bold text-emerald-400 mb-3">Machine Fleet Logistics</h3>
            <p className="text-green-700">Ensuring idle machinery is optimally routed to farms based on urgency, reducing downtime and maximizing efficiency.</p>
          </div>
          <div className="bg-white border border-green-200 p-6 rounded-xl hover:border-amber-500 transition-colors">
            <h3 className="text-xl font-bold text-amber-400 mb-3">Factory Processing Coordination</h3>
            <p className="text-green-700">Centralized dashboard for factories to oversee the entire pipeline from field to processing, broadcasting critical alerts seamlessly.</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* About my info */}
        <section>
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
            <Info className="text-green-500" /> About the Platform
          </h2>
          <div className="bg-white border border-green-200 p-8 rounded-xl h-full">
            <p className="text-green-800 leading-relaxed mb-4">
              This system is built to resolve the logistical nightmare of sugarcane harvesting. We connect Farmers, Machine Operators, and Factories in real-time.
            </p>
            <p className="text-green-800 leading-relaxed mb-4">
              By monitoring planting dates and crop sizes, the algorithm ensures fair and timely assignments, eliminating manual back-and-forth communication.
            </p>
            <ul className="space-y-3 mt-6 text-sm text-green-700">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-400" /> District-level tracking</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-green-400" /> Instant SMS/Socket notifications</li>
              <li className="flex items-center gap-2"><User className="h-4 w-4 text-amber-400" /> Multi-tenant role authentication</li>
            </ul>
          </div>
        </section>

        {/* Feedback & Enquiry Form */}
        <section>
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
            <Send className="text-emerald-500" /> Feedback & Enquiry
          </h2>
          <form onSubmit={handleEnquirySubmit} className="bg-white border border-green-200 p-8 rounded-xl space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-green-700 mb-1">Name</label>
              <input type="text" value={enquiry.name} onChange={e => setEnquiry({...enquiry, name: e.target.value})} required className="w-full bg-green-50 border border-green-200 rounded px-4 py-2 text-green-900 focus:border-green-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-green-700 mb-1">Phone Number</label>
                <input type="text" value={enquiry.phone} onChange={e => setEnquiry({...enquiry, phone: e.target.value})} required className="w-full bg-green-50 border border-green-200 rounded px-4 py-2 text-green-900 focus:border-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-green-700 mb-1">District</label>
                <select value={enquiry.district} onChange={e => setEnquiry({...enquiry, district: e.target.value})} required className="w-full bg-green-50 border border-green-200 rounded px-4 py-2 text-green-900 focus:border-green-500 outline-none">
                  <option value="">-- Choose District --</option>
                  {['Kolhapur', 'Sangli', 'Satara', 'Pune', 'Solapur', 'Ahmednagar', 'Nashik', 'Jalgaon', 'Latur', 'Osmanabad'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-green-700 mb-1">Role</label>
              <select value={enquiry.role} onChange={e => setEnquiry({...enquiry, role: e.target.value})} className="w-full bg-green-50 border border-green-200 rounded px-4 py-2 text-green-900 focus:border-green-500 outline-none">
                <option value="farmer">Farmer</option>
                <option value="machine">Machine Operator</option>
                <option value="factory admin">Factory Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-green-700 mb-1">Message</label>
              <textarea value={enquiry.msg} onChange={e => setEnquiry({...enquiry, msg: e.target.value})} required className="w-full bg-green-50 border border-green-200 rounded px-4 py-2 h-24 text-green-900 focus:border-green-500 outline-none"></textarea>
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded transition flex items-center justify-center gap-2">
              <Send className="h-4 w-4" /> Send Enquiry
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};