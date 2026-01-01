/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Clock, Activity, Bell, ChevronLeft, User, AlertCircle } from 'lucide-react';
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
        console.error("Dashboard Fetch Error:", err);
        setError(err.response?.data?.message || "Failed to load beneficiary profile");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetails();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-slate-500 italic text-center">Syncing Health Records...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <AlertCircle size={48} className="text-rose-500 mb-4" />
      <h2 className="text-lg font-black text-slate-800">{error}</h2>
      <button onClick={() => navigate(-1)} className="mt-6 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100">
        Go Back
      </button>
    </div>
  );

  const tabs = [
    { id: 'Antenatal', label: 'Antenatal', icon: <Heart size={16} /> },
    { id: 'Postnatal', label: 'Postnatal', icon: <Clock size={16} /> },
    { id: 'Child', label: 'Child (0-5y)', icon: <Activity size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20 lg:pb-10">
      {/* --- TOP NAVBAR: Adjusted for Mobile --- */}
      <nav className="bg-white px-4 md:px-8 py-3 md:py-4 flex flex-col gap-4 border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 shrink-0">
              <ChevronLeft size={24} />
            </button>
            
            <div className="w-10 h-10 md:w-11 md:h-11 bg-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100 shrink-0">
              <User size={20} strokeWidth={2.5} />
            </div>

            <div className="truncate">
              <h1 className="text-lg md:text-xl font-black text-slate-800 leading-tight truncate">
                {beneficiary?.name}
              </h1>
              <p className="text-[10px] md:text-xs font-bold text-emerald-600 uppercase tracking-wider">
                {beneficiary?.age}Y • {beneficiary?.village}
              </p>
            </div>
          </div>

          <div className="relative p-2.5 bg-slate-50 rounded-xl text-slate-400 border border-slate-100 shrink-0">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">3</span>
          </div>
        </div>

        {/* --- MOBILE TAB BAR: Horizontally Scrollable on small screens --- */}
        <div className="lg:hidden flex overflow-x-auto no-scrollbar gap-2 pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap shrink-0 border ${
                activeTab === tab.id 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100' 
                  : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* --- DESKTOP TAB BAR --- */}
        <div className="hidden lg:flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200 self-end">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-emerald-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* --- CONTENT AREA --- */}
      <main className="max-w-7xl mx-auto px-2 md:px-0">
        <div className="mt-4">
          {activeTab === 'Antenatal' && <AntenatalDashboard />}
          {activeTab === 'Postnatal' && <Postnatal />}
          {activeTab === 'Child' && <ChildCare />}
        </div>
      </main>
    </div>
  );
};

export default BeneficiaryDashboard;