import Sidebar from '../layout/Sidebar.jsx';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Top bar for notifications / search if needed */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
           <h2 className="text-slate-800 font-bold">Overview</h2>
           <div className="flex items-center gap-4">
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-black uppercase">System Live</span>
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