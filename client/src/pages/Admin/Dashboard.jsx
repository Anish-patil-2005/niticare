/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Import Hook
import { adminService } from '../../api/adminService';
import { 
  Users, 
  Activity, 
  AlertTriangle, 
  ClipboardList, 
  TrendingUp,
  Loader2,
  RefreshCcw
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, colorClass }) => (
  <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10 transition-transform group-hover:scale-110 duration-300`}>
        <Icon size={24} className={colorClass.replace('bg-', 'text-')} strokeWidth={2.5} />
      </div>
      {trend && (
        <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
          <TrendingUp size={12} /> {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.15em]">{title}</p>
      <h3 className="text-3xl font-black text-slate-800 mt-1 tracking-tight">
        {value.toLocaleString()}
      </h3>
    </div>
  </div>
);

const Dashboard = () => {
  const { t, i18n } = useTranslation(); // Initialize Translation
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardStats();
      const serverData = response.data?.data || response.data || response;
      if (serverData) setStats(serverData);
      setError(null);
    } catch (err) {
      setError(t('admin.connecting_db')); // Or a custom error key
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return (
    <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
      <Loader2 className="animate-spin text-primary" size={40} />
      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{t('common.loading')}</p>
    </div>
  );

  const dashboardCards = [
    { 
      title: t('admin.total_pregnancies'), 
      value: stats?.totalPregnancies || 0, 
      icon: Users, 
      trend: '+4%', 
      colorClass: 'bg-green-400' 
    },
    { 
      title: t('admin.high_risk_cases'), 
      value: stats?.highRiskCases || 0, 
      icon: AlertTriangle, 
      trend: 'Urgent', 
      colorClass: 'bg-red-500' 
    },
    { 
      title: t('admin.pending_allocation'), 
      value: stats?.pendingAllocation || 0, 
      icon: Activity, 
      trend: 'Action', 
      colorClass: 'bg-orange-500' 
    },
    { 
      title: t('admin.incomplete_records'), 
      value: stats?.incompleteRecords || 0, 
      icon: ClipboardList, 
      trend: 'Sync', 
      colorClass: 'bg-blue-500' 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('common.overview')}</h1>
          <div className="flex items-center gap-2 mt-1">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             <p className="text-slate-500 text-xs font-medium">
               {/* Localized Time String */}
               Live as of {new Date(stats?.lastUpdated).toLocaleTimeString(i18n.language)}
             </p>
          </div>
        </div>
        <div className="flex gap-3">
            <button 
              onClick={fetchStats}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
            >
              <RefreshCcw size={18} />
            </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-700 text-sm font-bold">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      {/* Visualizations Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-100 p-8 min-h-[400px] flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-primary-glow rounded-full flex items-center justify-center mb-4 text-primary">
            <TrendingUp size={32} />
          </div>
          <h4 className="text-slate-800 font-bold">{t('admin.geo_distribution')}</h4>
          <p className="text-slate-400 text-sm max-w-xs mt-2">{t('admin.connecting_db')}</p>
        </div>

        <div className="bg-white rounded-[32px] border border-slate-100 p-8">
          <h4 className="text-slate-900 font-bold mb-6 flex items-center gap-2">
            {t('admin.hr_alerts')}
          </h4>
          <div className="space-y-6">
            {stats?.highRiskCases > 0 ? (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                    <p className="text-xs font-black text-red-600 uppercase mb-1">Attention Required</p>
                    <p className="text-sm text-red-700 font-medium">
                      {stats.highRiskCases} {t('admin.attention_required')}
                    </p>
                </div>
            ) : (
                <p className="text-slate-400 text-sm italic">No critical alerts today.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;