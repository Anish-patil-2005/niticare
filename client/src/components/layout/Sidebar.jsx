/* eslint-disable no-undef */
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserRoundCog, 
  FileText, 
  Database, 
  HeartPulse, 
  ArrowUpRight,
  ClipboardCheck,
  Users,
  Settings
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/ashas', icon: Users, label: 'ASHA Management' },
    { path: '/admin/beneficiaries', icon: UserRoundCog, label: 'Beneficiaries' },
    { path: '/admin/sync-data', icon: Database, label: 'Data Sync' },
    { path: '/admin/assignments', icon: ClipboardCheck, label: 'Task Allocation' },
    { path: '/admin/forms', icon: FileText, label: 'Form Builder' },
    { path: '/admin/export', icon: ArrowUpRight, label: 'Reports & Export' },
  ];

  return (
    <aside className="w-72 bg-white h-screen flex flex-col border-r border-slate-100 shadow-sm z-50">
      {/* Branding Section */}
      <div className="p-8 flex items-center gap-3">
        <div className="bg-primary shadow-lg shadow-primary/20 p-2 rounded-xl">
          <HeartPulse className="text-white" size={24} strokeWidth={2.5} />
        </div>
        <div>
          <span className="text-xl font-black text-slate-800 tracking-tight block leading-none">NitiCare</span>
          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Admin Suite</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Main Menu</p>
        
        {menuItems.map((item) => (
  <NavLink
    key={item.path}
    to={item.path}
    // Correct destructuring: ({ isActive }) => ...
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group
      ${isActive 
        ? 'bg-primary-glow text-primary font-bold shadow-sm border border-primary/10' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
    `}
  >
    {/* Inside the component, we need to pass the isActive state to style the icon too */}
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

      {/* Profile / Bottom Section */}
      <div className="p-6 mt-auto">
        <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 border border-slate-100">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">Administrator</p>
            <p className="text-[10px] text-slate-500 truncate uppercase tracking-tighter font-bold">Health Department</p>
          </div>
          <button className="text-slate-400 hover:text-red-500 transition-colors">
             <Settings size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;