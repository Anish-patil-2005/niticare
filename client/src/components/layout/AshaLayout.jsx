/* eslint-disable no-undef */
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  UserPlus, 
  LogOut, 
  Menu, 
  X, 
  User,
  Settings,
  HeartPulse,
  ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { LanguageSelector } from '../LanguageSelector'; // Import your component

const AshaLayout = () => {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const userStr = localStorage.getItem('user');
  const userData = userStr ? JSON.parse(userStr) : null;

  const menuItems = [
    { name: t('nav.dashboard'), path: '/asha/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: t('nav.my_beneficiaries'), path: '/asha/beneficiaries', icon: <User size={20} /> },
    { name: t('nav.register'), path: '/asha/register', icon: <UserPlus size={20} /> },
    { name: t('nav.reports_export'),path: '/asha/export', icon: <ArrowUpRight size={20}/>},

  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success(t('common.logout'));
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-8 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-100">
                <HeartPulse className="text-white" size={24} />
              </div>
              <div>
                <span className="text-xl font-black text-slate-800 tracking-tight block leading-none">{t('nav.niticare')}</span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{t('nav.asha_companion')}</span>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400">
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t('nav.staff')}</p>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all
                    ${isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <span className={isActive ? 'text-emerald-600' : 'text-slate-400'}>{item.icon}</span>
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* --- Unified Language Selector --- */}
          <div className="px-6 py-2">
            <LanguageSelector dropdownDirection="up" />
          </div>

          {/* User Section */}
          <div className="p-6 border-t border-slate-50">
            <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-100">
                {userData?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{userData?.full_name || 'ASHA Worker'}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">{t('nav.staff')}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => navigate('/asha/profile')} className="text-slate-400 hover:text-emerald-600 p-1" title={t('common.settings')}>
                  <Settings size={18} />
                </button>
                <button onClick={handleLogout} className="text-slate-400 hover:text-rose-500 p-1" title={t('common.logout')}>
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Toggle */}
        {!isSidebarOpen && (
          <div className="md:hidden fixed top-4 left-4 z-40">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="p-3 bg-white border shadow-lg rounded-2xl text-gray-600 hover:bg-slate-50 transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
        )}
        
        <main className="flex-1 overflow-y-auto w-full custom-scrollbar">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}
    </div>
  );
};

export default AshaLayout;