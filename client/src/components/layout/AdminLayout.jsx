import { useState } from 'react';
import Sidebar from '../layout/Sidebar.jsx';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../LanguageSelector.jsx';
import { Menu, X } from 'lucide-react';

const AdminLayout = () => {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Wrapper */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-8 shrink-0">
            <div className="flex items-center gap-3">
              {/* Toggle Button for Mobile/Tablet */}
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-xl"
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h2 className="text-slate-800 font-bold truncate">{t('common.overview')}</h2>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <div className="w-24 md:w-32"> 
                <LanguageSelector /> 
              </div>

              <div className="hidden sm:block h-8 w-[1px] bg-slate-100 mx-1" />

              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-black uppercase whitespace-nowrap">
                {t('common.system_live')}
              </span>
            </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;