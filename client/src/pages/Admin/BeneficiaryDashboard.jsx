/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Added hook
import { 
  Heart, Clock, Activity, Bell, ChevronLeft, User, 
  AlertCircle, MapPin, Calendar, Phone, Fingerprint, 
  ShieldCheck, Info, Baby
} from 'lucide-react';
import { ashaService } from '../../api/ashaService.js'; 
import { AntenatalDashboard } from '../Asha/Antenatal/AntenatalDashboard.jsx';
import { Postnatal } from '../Asha/Postnatal/Postnatal.jsx';
import { ChildCare } from '../Asha/Child/Child.jsx';

const BeneficiaryDashboard = () => {
  const { t } = useTranslation(); // Initialize translation
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
        <p className="mt-6 text-sm font-black text-slate-400 uppercase tracking-widest">{t('common.loading')}</p>
      </div>
    </div>
  );

  const tabs = [
    { id: 'Antenatal', label: t('medical.antenatal'), icon: <Heart size={18} />, color: 'text-rose-500' },
    { id: 'Postnatal', label: t('medical.postnatal'), icon: <Baby size={18} />, color: 'text-amber-500' },
    { id: 'Child', label: t('medical.child_care'), icon: <Activity size={18} />, color: 'text-indigo-500' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-10">
      {/* --- TOP NAV --- */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight hidden md:block ml-2">{t('common.maternalModule')}</h2>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                ID: {beneficiary?.govt_id}
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 mt-6 space-y-6">
        
        {/* --- BENEFICIARY HERO CARD --- */}
        <section className={`bg-white rounded-[2.5rem] p-6 md:p-8 border shadow-sm transition-all ${beneficiary?.is_high_risk ? 'border-red-100 shadow-red-50' : 'border-slate-100'}`}>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Profile Avatar */}
            <div className="relative self-center lg:self-start">
              <div className={`w-28 h-28 rounded-[2.2rem] flex items-center justify-center text-white shadow-2xl ${beneficiary?.is_high_risk ? 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-200' : 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-100'}`}>
                <User size={48} strokeWidth={1.5} />
              </div>
              {beneficiary?.is_high_risk && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter animate-bounce">
                  {t('dashboard.high_risk')}
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="flex-1 space-y-6">
              <div>
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">{beneficiary?.name}</h1>
                  <span className="w-fit flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase">
                    <Fingerprint size={12} /> {beneficiary?.govt_id}
                  </span>
                </div>
                
                {/* Details Row */}
                <div className="flex flex-wrap gap-3 mt-4">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl">
                    <Calendar size={14} className="text-primary" />
                    <span className="text-xs font-bold text-slate-600">{beneficiary?.age} {t('medical.years')}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl">
                    <MapPin size={14} className="text-primary" />
                    <span className="text-xs font-bold text-slate-600">{beneficiary?.village}, {beneficiary?.state}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl">
                    <Phone size={14} className="text-primary" />
                    <span className="text-xs font-bold text-slate-600">{beneficiary?.contact_number}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 px-4 py-2 rounded-2xl">
                    <Clock size={14} className="text-rose-500" />
                    <span className="text-xs font-black text-rose-600 uppercase">{t('medical.edd')}: {new Date(beneficiary?.edd).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Medical & Source Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-start gap-3">
                   <div className="p-2 bg-orange-50 text-orange-500 rounded-xl"><Info size={16}/></div>
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('forms.med_history')}</p>
                     <p className="text-sm font-bold text-slate-700">{beneficiary?.medical_fields?.history || t('common.no')}</p>
                   </div>
                </div>
                <div className="flex items-start gap-3">
                   <div className="p-2 bg-blue-50 text-blue-500 rounded-xl"><ShieldCheck size={16}/></div>
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('medical.bloodGroup')}</p>
                     <p className="text-sm font-bold text-slate-700">{beneficiary?.medical_fields?.blood_group || 'Unknown'}</p>
                   </div>
                </div>
                <div className="flex items-start gap-3">
                   <div className="p-2 bg-slate-50 text-slate-500 rounded-xl"><Fingerprint size={16}/></div>
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('forms.reg_source')}</p>
                     <p className="text-sm font-bold text-slate-700 uppercase">{beneficiary?.registration_source?.replace('_', ' ')}</p>
                   </div>
                </div>
              </div>
            </div>

            {/* Tab Control */}
            <div className="hidden xl:flex flex-col gap-2 min-w-[200px]">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-between px-5 py-4 rounded-2xl text-xs font-black transition-all ${
                    activeTab === tab.id 
                      ? 'bg-slate-900 text-white shadow-xl translate-x-2' 
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-3">{tab.icon} {tab.label.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* --- MOBILE TABS --- */}
        <div className="xl:hidden flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl text-[11px] font-black whitespace-nowrap transition-all border ${
                activeTab === tab.id ? 'bg-primary text-white border-primary shadow-lg' : 'bg-white text-slate-500 border-slate-100'
              }`}
            >
              {tab.icon} {tab.label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* --- MAIN CONTENT --- */}
        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[500px] overflow-hidden">
          <div className="p-4 md:p-8">
             {activeTab === 'Antenatal' && <AntenatalDashboard beneficiaryData={beneficiary} />}
             {activeTab === 'Postnatal' && <Postnatal beneficiaryData={beneficiary} />}
             {activeTab === 'Child' && <ChildCare phase="child_care" beneficiaryData={beneficiary} />}         
          </div> 
        </section>
      </main>
    </div>
  );
};

export default BeneficiaryDashboard;