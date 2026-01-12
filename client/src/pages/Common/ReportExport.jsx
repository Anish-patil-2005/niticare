import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Standard translation hook
import { MapPin, Loader2, Download, AlertTriangle, CheckCircle2, Users, FileBarChart, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../api/adminService.js';
import { ashaService } from '../../api/ashaService.js';
import { reportService } from '../../api/reportexportService.js';

export const ReportExport = ({ mode = 'admin' }) => {
  const isAshaMode = mode === 'asha';
  
  // useTranslation provides the 't' function
  // useTransition is a React hook for UI concurrency, handled separately if needed
  const { t } = useTranslation(); 
  
  const [villages, setVillages] = useState([]);
  const [filters, setFilters] = useState({
    village: 'all',
    is_high_risk: false,
    pending_allocation: false,
    incomplete: false
  });
  const [loading, setLoading] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  useEffect(() => {
    const fetchVillages = async () => {
      try {
        setLoading(true);
        const res = isAshaMode
          ? await ashaService.getAssignedBeneficiaries()
          : await adminService.getBeneficiaries();
        const data = res.data?.data || res.data || [];
        const uniqueVillages = [...new Set(data.map((b) => b.village))].filter(Boolean).sort();
        setVillages(uniqueVillages);
      } catch (err) {
        toast.error(t('reports.notifications.villageError'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVillages();
  }, [mode, t]);

  const handleBeneficiaryExport = async () => {
    setLoading(true);
    try {
      const payload = {
        village: filters.village === 'all' ? '' : filters.village,
        is_high_risk: filters.is_high_risk || undefined,
        is_data_complete: filters.incomplete ? false : undefined,
        pending_allocation: filters.pending_allocation || undefined
      };

      await reportService.downloadExcel('/reports/export-beneficiaries', payload);
      toast.success(t('reports.notifications.exportSuccess'));
    } catch (err) {
      console.error(err);
      toast.error(t('reports.notifications.exportError'));
    } finally {
      setLoading(false);
    }
  };

  const handleAdminExport = async () => {
    setLoadingAdmin(true);
    try {
      const payload = { include_asha_details: true };
      await reportService.downloadExcel('/reports/asha-performance', payload);
      toast.success(t('reports.notifications.ashaSuccess'));
    } catch (err) {
      console.error(err);
      toast.error(t('reports.notifications.ashaError'));
    } finally {
      setLoadingAdmin(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg text-white">
              <LayoutDashboard size={20} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('reports.title')}</h1>
          </div>
          <p className="text-slate-500 font-medium pl-11">
            {isAshaMode ? t('reports.ashaDesc') : t('reports.adminDesc')}
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border-2 border-emerald-100 shadow-sm shadow-emerald-100/50">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isAshaMode ? 'bg-blue-500' : 'bg-emerald-500'}`} />
            <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              {isAshaMode ? t('reports.ashaPortal') : t('reports.adminConsole')}
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/60 overflow-hidden transition-all hover:border-emerald-300">
          <div className="h-2 bg-gradient-to-r from-emerald-500 to-emerald-700" /> 
          <div className="p-6 md:p-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 ring-1 ring-emerald-100">
                  <FileBarChart size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800">
                    {isAshaMode ? t('reports.beneficiaryTitle') : t('reports.masterTitle')}
                  </h2>
                  <p className="text-slate-500 font-medium">{t('reports.filterSubtitle')}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/80 p-6 md:p-8 rounded-[2rem] border border-slate-100 ring-1 ring-white">
              <div className="lg:col-span-4 space-y-3">
                <label className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 ml-1">{t('reports.geoLabel')}</label>
                <div className="flex items-center gap-3 bg-white border-2 border-slate-100 rounded-2xl px-4 py-3.5 shadow-sm focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all group">
                  <MapPin size={20} className="text-emerald-500 group-focus-within:scale-110 transition-transform" />
                  <select
                    className="bg-transparent text-sm font-bold text-slate-700 outline-none w-full cursor-pointer appearance-none"
                    value={filters.village}
                    onChange={(e) => setFilters({ ...filters, village: e.target.value })}
                  >
                    <option value="all">{isAshaMode ? t('reports.allAshaVillages') : t('reports.allAdminVillages')}</option>
                    {villages.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-3">
                <label className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 ml-1">{t('reports.priorityLabel')}</label>
                <div className="flex flex-wrap gap-3">
                  <ToggleButton
                    label={t('reports.highRisk')}
                    active={filters.is_high_risk}
                    onClick={() => setFilters({ ...filters, is_high_risk: !filters.is_high_risk })}
                    icon={<AlertTriangle size={16} />}
                    activeClass="bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-200"
                  />
                  {!isAshaMode && (
                    <ToggleButton
                      label={t('reports.unassigned')}
                      active={filters.pending_allocation}
                      onClick={() => setFilters({ ...filters, pending_allocation: !filters.pending_allocation })}
                      icon={<Users size={16} />}
                      activeClass="bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-200"
                    />
                  )}
                  <ToggleButton
                    label={t('reports.incomplete')}
                    active={filters.incomplete}
                    onClick={() => setFilters({ ...filters, incomplete: !filters.incomplete })}
                    icon={<CheckCircle2 size={16} />}
                    activeClass="bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200"
                  />
                </div>
              </div>

              <div className="lg:col-span-3 flex items-end">
                <button
                  onClick={handleBeneficiaryExport}
                  disabled={loading}
                  className="w-full h-[58px] bg-emerald-600 text-white rounded-2xl flex items-center justify-center gap-3 hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale font-black shadow-xl shadow-emerald-200 ring-2 ring-emerald-500 ring-offset-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={22} /> : <Download size={22} />}
                  {t('reports.exportBtn')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {!isAshaMode && (
          <div className="relative group overflow-hidden bg-white rounded-[2.5rem] border border-emerald-100 p-1 shadow-xl shadow-emerald-100/20">
            <div className="absolute inset-0 bg-emerald-600 opacity-[0.03] pointer-events-none" />
            <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="p-5 bg-emerald-600 text-white rounded-[2rem] shadow-2xl shadow-emerald-200 transform group-hover:rotate-6 transition-transform">
                  <Users size={32} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-slate-800">{t('reports.analyticsTitle')}</h2>
                  <p className="text-slate-500 font-medium">{t('reports.analyticsDesc')}</p>
                </div>
              </div>
              
              <button
                onClick={handleAdminExport}
                disabled={loadingAdmin}
                className="w-full md:w-auto px-10 py-5 bg-emerald-600 text-white rounded-[1.5rem] flex items-center justify-center gap-3 hover:bg-emerald-800 active:scale-[0.98] transition-all disabled:opacity-50 font-black shadow-2xl shadow-slate-300"
              >
                {loadingAdmin ? <Loader2 className="animate-spin" size={22} /> : <Download size={22} />}
                {t('reports.downloadBtn')}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-center gap-2 pt-8 opacity-60">
        <div className="h-px w-24 bg-slate-200" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
          {t('reports.footer')}
        </p>
      </div>
    </div>
  );
};

const ToggleButton = ({ label, active, onClick, icon, activeClass }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2.5 px-5 py-3.5 rounded-[1.25rem] border-2 text-xs font-black transition-all duration-300 active:scale-90
      ${active ? activeClass : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-200 hover:text-emerald-600 shadow-sm'}`}
  >
    {icon} {label}
  </button>
);