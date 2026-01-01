/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Clock, Activity, Bell, ChevronLeft, User, AlertCircle, MapPin, Calendar, Phone } from 'lucide-react';
import { ashaService } from '../../api/ashaService.js'; 

import { AntenatalDashboard } from '../Asha/Antenatal/AntenatalDashboard.jsx';
import { Postnatal } from '../Asha/Postnatal/Postnatal.jsx';
import { ChildCare } from '../Asha/Child/Child.jsx';

const BeneficiaryDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Antenatal');
  const [beneficiary, setBeneficiary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ashaService.getBeneficiaryById(id);
        setBeneficiary(response.data || response);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load beneficiary profile");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetails();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white p-6">
      <div className="flex flex-col items-center">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>
            <div className="absolute top-0 w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-sm font-black text-slate-400 uppercase tracking-widest">Loading Health File...</p>
      </div>
    </div>
  );

  const tabs = [
    { id: 'Antenatal', label: 'Antenatal', icon: <Heart size={18} />, color: 'text-rose-500', bg: 'bg-rose-50' },
    { id: 'Postnatal', label: 'Postnatal', icon: <Clock size={18} />, color: 'text-amber-500', bg: 'bg-amber-50' },
    { id: 'Child', label: 'Child Care', icon: <Activity size={18} />, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-10">
      {/* --- REFINED TOP NAV --- */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <ChevronLeft size={24} />
            </button>
            <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden md:block" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight hidden md:block">Beneficiary Profile</h2>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex -space-x-2 mr-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center text-emerald-700 text-[10px] font-bold">AB</div>
             </div>
             <button className="relative p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
             </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 mt-6 space-y-6">
        
        {/* --- BENEFICIARY HERO CARD --- */}
        <section className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
           <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-emerald-100">
                <User size={44} strokeWidth={1.5} />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-xl shadow-md border border-slate-50">
                 <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                    <AlertCircle size={14} />
                 </div>
              </div>
           </div>

           <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">{beneficiary?.name}</h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    <Calendar size={12} /> {beneficiary?.age} Years
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    <MapPin size={12} /> {beneficiary?.village}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                    <Phone size={12} /> {beneficiary?.contact_number || 'No Phone'}
                  </span>
                </div>
              </div>
              
              {/* Dynamic Sub-Info based on Phase */}
              <div className="pt-4 border-t border-slate-50 flex flex-wrap gap-6 justify-center md:justify-start">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Phase</p>
                    <p className="text-sm font-black text-emerald-600 uppercase">{activeTab}</p>
                 </div>
        
              </div>
           </div>

           {/* --- DESKTOP TAB SWITCHER (Inside Hero) --- */}
           <div className="hidden lg:flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 self-center">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${
                    activeTab === tab.id 
                      ? 'bg-white text-emerald-600 shadow-md' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab.icon} {tab.label.toUpperCase()}
                </button>
              ))}
           </div>
        </section>

        {/* --- MOBILE TAB BAR (Floating or Sticky below Hero) --- */}
        <div className="lg:hidden flex overflow-x-auto no-scrollbar gap-3 py-2 -mx-4 px-4 sticky top-16 z-30 bg-[#F8FAFC]/80 backdrop-blur-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl text-[11px] font-black transition-all whitespace-nowrap border-2 shrink-0 shadow-sm ${
                activeTab === tab.id 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-100' 
                  : 'bg-white text-slate-500 border-white hover:border-slate-100'
              }`}
            >
              {tab.icon} {tab.label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* --- MAIN DASHBOARD CONTENT --- */}
        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[500px] overflow-hidden">
          <div className="p-2 md:p-4">
             {activeTab === 'Antenatal' && <AntenatalDashboard />}
             {activeTab === 'Postnatal' && <Postnatal />}
             {activeTab === 'Child' && <ChildCare />}
          </div>
        </section>
      </main>
    </div>
  );
};

export default BeneficiaryDashboard;