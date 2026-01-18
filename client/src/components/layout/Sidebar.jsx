import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, UserRoundCog, FileText, Database, HeartPulse, 
  ArrowUpRight, ClipboardCheck, Users, Settings, LogOut, IndianRupee, X
} from 'lucide-react';
import toast from 'react-hot-toast';

const Sidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { path: '/admin/ashas', icon: Users, label: t('nav.asha_mgmt') },
    { path: '/admin/beneficiaries', icon: UserRoundCog, label: t('nav.beneficiaries') },
    { path: '/admin/sync-data', icon: Database, label: t('nav.data_sync') },
    { path: '/admin/assignments', icon: ClipboardCheck, label: t('nav.task_allocation') },
    { path: '/admin/forms', icon: FileText, label: t('nav.form_builder') },
    { path: '/admin/asha-payment', icon: IndianRupee, label: t('nav.asha_payment') },
    { path: '/admin/export', icon: ArrowUpRight, label: t('nav.reports_export') },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success(t('common.logout'));
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-72 bg-white h-screen flex flex-col border-r border-slate-100 shadow-xl lg:shadow-sm">
      {/* Branding Section */}
      <div className="p-8 pb-6 flex items-center justify-between lg:justify-start gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary shadow-lg shadow-primary/20 p-2 rounded-xl">
            <HeartPulse className="text-white" size={24} strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-xl font-black text-slate-800 tracking-tight block leading-none">{t('nav.niticare')}</span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{t('nav.admin_suite')}</span>
          </div>
        </div>
        
        {/* Close button inside sidebar for mobile only */}
        <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
          {t('common.actions')}
        </p>
        
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose} // Closes sidebar on mobile after clicking link
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group
              ${isActive 
                ? 'bg-primary-glow text-primary font-bold shadow-sm border border-primary/10' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  size={20} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`} 
                />
                <span className="text-sm tracking-tight">{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Profile Section */}
      <div className="p-6 mt-auto border-t border-slate-50">
        <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 border border-slate-100">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">AD</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">Administrator</p>
            <p className="text-[10px] text-slate-500 truncate uppercase tracking-tighter font-bold">Health Dept</p>
          </div>
          <div className="flex gap-1 shrink-0">
            <button onClick={() => { navigate('/admin/profile'); onClose(); }} className="text-slate-400 hover:text-primary p-1">
              <Settings size={18} />
            </button>
            <button onClick={handleLogout} className="text-slate-400 hover:text-rose-500 p-1">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;