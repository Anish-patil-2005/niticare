import Sidebar from '../layout/Sidebar.jsx';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../LanguageSelector.jsx';
const AdminLayout = () => {
  const { t } = useTranslation();

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
            <h2 className="text-slate-800 font-bold">{t('common.overview')}</h2>
            
            <div className="flex items-center gap-4">
              {/* Language Selector placed right before the live tag */}
              <div className="w-32"> 
                <LanguageSelector /> 
              </div>

              <div className="h-8 w-[1px] bg-slate-100 mx-1" /> {/* Optional Divider */}

              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-black uppercase whitespace-nowrap">
                {t('common.system_live')}
              </span>
            </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;