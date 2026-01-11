/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 1. Import hook
import { ashaService } from '../../api/ashaService';
import { 
  Users, AlertCircle, Calendar, Clock, 
  ChevronRight, CheckCircle2, UserPlus 
} from 'lucide-react';
import toast from 'react-hot-toast';

const AshaDashboard = () => {
  const { t } = useTranslation(); // 2. Initialize translation
  const [stats, setStats] = useState({
    myBeneficiaries: 0,
    highRisk: 0,
    todayVisits: 0,
    dueThisMonth: 0
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, tasksRes] = await Promise.all([
        ashaService.getDashboardStats(),
        ashaService.getTodayPriorityTasks() 
      ]);
      
      setStats(statsRes.data?.data || statsRes.data || {});
      setTasks(tasksRes.data?.data || tasksRes.data || []);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      toast.error(t('common.error')); // Localized error
    } finally {
      setLoading(false);
    }
  };

  const handleTaskNavigation = (task) => {
    const { beneficiary_id, form_id, month_number, phase } = task;
    let url = `/asha/fill-form/${form_id}/${beneficiary_id}`;
    
    if (phase === 'child_care' || phase === 'child') {
      const childMonths = "1,2,3,4,5,6,7,8,9,10,12,15,18,24,36,48,60";
      url += `?month=${childMonths}&phase=child_care`;
    } else {
      url += `?month=${month_number || 1}`;
    }
    navigate(url);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-24">
      <header>
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
          {t('dashboard.overview')}
        </h1>
        <p className="text-gray-500 font-medium font-mono text-sm uppercase tracking-widest text-[10px]">
          {t('nav.asha_companion')}
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: t('dashboard.assigned'), val: stats?.myBeneficiaries, icon: Users, color: 'emerald' },
          { label: t('dashboard.high_risk'), val: stats?.highRisk, icon: AlertCircle, color: 'red' },
          { label: t('dashboard.today'), val: stats?.todayVisits, icon: Calendar, color: 'blue' },
          { label: t('dashboard.monthly_due'), val: stats?.dueThisMonth, icon: Clock, color: 'purple' },
        ].map((item, idx) => (
          <div key={idx} className={`bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 border-l-4 border-l-${item.color}-500 transition-all hover:shadow-md`}>
            <div className={`p-3 bg-${item.color}-50 text-${item.color}-600 rounded-2xl`}>
              <item.icon size={24}/>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
              <p className="text-2xl font-black text-gray-900">{item.val || 0}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Priority Tasks */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
            <h3 className="font-black text-gray-900 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-blue-600" />
              {t('dashboard.priority_tasks')}
            </h3>
            <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase">
              {tasks?.length || 0} {t('dashboard.pending')}
            </span>
          </div>
          
          <div className="divide-y divide-gray-100 min-h-[250px] max-h-[500px] overflow-y-auto">
            {tasks?.length > 0 ? (
              tasks.map((task) => (
                <div key={task.schedule_id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold uppercase">
                      {task.beneficiary_name?.[0] || 'B'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{task.beneficiary_name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{task.form_name}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleTaskNavigation(task)}
                    className="p-2 bg-gray-100 text-gray-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-400 font-medium">
                <Calendar className="mx-auto mb-4 text-gray-300" />
                {loading ? t('common.loading') : t('dashboard.no_visits')}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="font-black text-gray-900 px-2 uppercase text-xs tracking-widest">
            {t('dashboard.quick_actions')}
          </h3>
          <button 
            onClick={() => navigate('/asha/register')}
            className="w-full p-6 bg-emerald-600 text-white rounded-[2rem] shadow-xl shadow-emerald-100 flex items-center justify-between hover:bg-emerald-700 hover:-translate-y-1 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 rounded-2xl"><UserPlus size={28}/></div>
              <div className="text-left">
                <p className="font-black text-xl">{t('dashboard.register_mother')}</p>
                <p className="text-sm text-emerald-100 font-medium italic">{t('dashboard.add_new')}</p>
              </div>
            </div>
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AshaDashboard;