import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/adminService';
import { 
  UserPlus, Trash2, MapPin, Search, Loader2, 
  X, ShieldCheck, Phone, Mail 
} from 'lucide-react';

const AshaManagement = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State - Mapping to your DB Schema
  const [formData, setFormData] = useState({
    full_name: '', 
    username: '', 
    password: '', 
    contact_number: '', 
    village: ''
  });

  /**
   * Fetch workers and handle the nested data structure from the backend
   */
const fetchWorkers = async () => {
  try {
    setLoading(true);
    const response = await adminService.getAshaWorkers();
    
    // Check for data in three possible locations to be 100% safe
    const actualData = response.data || response || [];
    
    console.log("Extracted Array:", actualData); // This should show [ {...} ] in console

    if (Array.isArray(actualData)) {
      setWorkers(actualData);
    } else {
      console.error("Data received is not an array:", actualData);
      setWorkers([]);
    }
  } catch (err) {
    console.error("API Error:", err);
    setWorkers([]);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => { fetchWorkers(); }, []);

  /**
   * Handle Search Filter
   */
  const filteredWorkers = workers.filter(w => {
    const name = (w.full_name || "").toLowerCase();
    const village = (w.village || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || village.includes(search);
  });

  /**
   * Register New ASHA Worker
   */
  const handleAddWorker = async (e) => {
    e.preventDefault();
    try {
      await adminService.addAshaWorker(formData);
      setIsModalOpen(false);
      // Reset form fields
      setFormData({ full_name: '', username: '', password: '', contact_number: '', village: '' });
      fetchWorkers();
      alert("ASHA Worker registered successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed. Ensure username is unique.");
    }
  };

  /**
   * Delete Worker with workload protection
   */
  const handleDelete = async (id, workload) => {
    if (Number(workload) > 0) {
      alert(`Safety Lock: Cannot delete a worker managing ${workload} active patients.`);
      return;
    }
    if (!window.confirm("Are you sure you want to remove this worker from the system?")) return;
    
    try {
      await adminService.deleteAshaWorker(id);
      fetchWorkers();
    } catch (err) {
      alert(err.response?.data?.message || "Deletion failed");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">ASHA Management</h1>
          <p className="text-slate-500 text-sm font-medium">Manage deployment and health worker registries.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary-niti !w-auto px-6 shadow-emerald-500/20 flex items-center gap-2"
        >
          <UserPlus size={18} /> Register New ASHA
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative group w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Search by name or village..."
            className="input-niti pl-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
          Total Registry: {workers.length}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal Info</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Village</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Workload</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan="4" className="py-24 text-center">
                  <Loader2 className="animate-spin text-primary mx-auto mb-4" size={32} />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fetching Personnel Data...</p>
                </td>
              </tr>
            ) : filteredWorkers.length > 0 ? (
              filteredWorkers.map((worker) => (
                <tr key={worker.id} className="hover:bg-slate-50/40 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-primary-glow text-primary flex items-center justify-center font-black text-lg border border-primary/10">
                        {worker.full_name ? worker.full_name[0] : '?'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 leading-tight">{worker.full_name}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                           <span className="text-[11px] text-slate-400 flex items-center gap-1 font-bold">
                             <Mail size={12} className="text-slate-300" /> {worker.username}
                           </span>
                           {worker.contact_number && worker.contact_number !== 'No Contact' && (
                             <span className="text-[11px] text-slate-400 flex items-center gap-1 font-bold">
                               <Phone size={12} className="text-slate-300" /> {worker.contact_number}
                             </span>
                           )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-black uppercase tracking-tight">
                      <MapPin size={12} className="text-slate-400" /> {worker.village || 'Unassigned'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className={`text-sm font-black ${Number(worker.workload) > 10 ? 'text-orange-500' : 'text-primary'}`}>
                        {worker.workload || 0}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Mothers</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => handleDelete(worker.id, worker.workload)} 
                      className={`p-2.5 rounded-xl transition-all ${
                        Number(worker.workload) > 0 
                        ? 'text-slate-200 cursor-not-allowed' 
                        : 'text-slate-300 hover:text-red-500 hover:bg-red-50 shadow-sm'
                      }`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-24 text-center">
                  <div className="max-w-xs mx-auto">
                    <Search className="mx-auto text-slate-200 mb-4" size={40} />
                    <p className="text-slate-400 font-bold">No workers found matching your search</p>
                    <button onClick={() => setSearchTerm('')} className="text-primary text-xs font-black uppercase mt-2 hover:underline">Clear Search</button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Registration Modal - Slide-over Design */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-slate-900/40 backdrop-blur-sm p-4 overflow-hidden">
          <div className="bg-white w-full max-w-lg h-full rounded-[40px] shadow-2xl p-10 overflow-y-auto animate-in slide-in-from-right duration-500 border-l border-white/20">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-glow text-primary rounded-2xl"><ShieldCheck size={28}/></div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">ASHA Onboarding</h2>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Personnel Registry</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"><X /></button>
            </div>

            <form onSubmit={handleAddWorker} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Legal Name</label>
                <input 
                  required 
                  className="input-niti bg-slate-50/50" 
                  placeholder="e.g. Suman Devi" 
                  value={formData.full_name}
                  onChange={e => setFormData({...formData, full_name: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username/ID</label>
                  <input 
                    required 
                    className="input-niti bg-slate-50/50 text-sm" 
                    placeholder="suman_asha" 
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                  <input 
                    required 
                    type="password" 
                    className="input-niti bg-slate-50/50 text-sm" 
                    placeholder="••••••••" 
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contact Phone</label>
                <input 
                  required 
                  className="input-niti bg-slate-50/50" 
                  placeholder="+91 XXXXX XXXXX" 
                  value={formData.contact_number}
                  onChange={e => setFormData({...formData, contact_number: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assigned Village</label>
                <input 
                  required 
                  className="input-niti bg-slate-50/50" 
                  placeholder="Enter village or block name" 
                  value={formData.village}
                  onChange={e => setFormData({...formData, village: e.target.value})} 
                />
              </div>

              <div className="pt-6">
                <button type="submit" className="btn-primary-niti py-4 shadow-xl shadow-emerald-500/20 text-base">
                  Verify & Register Worker
                </button>
                <p className="text-[10px] text-slate-400 text-center mt-4 font-medium italic">
                  By clicking register, you authorize this worker access to village healthcare records.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AshaManagement;