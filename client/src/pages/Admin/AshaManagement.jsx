import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Integrated Translation Hook
import { adminService } from '../../api/adminService';
import toast, { Toaster } from 'react-hot-toast';
import { 
  UserPlus, Trash2, MapPin, Search, Loader2, 
  X, ShieldCheck, Phone, Mail 
} from 'lucide-react';

const AshaManagement = () => {
  const { t } = useTranslation(); // Initialize translation function
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    full_name: '', 
    username: '', 
    password: '', 
    contact_number: '', 
    village: ''
  });

  /**
   * Fetch Workers
   */
  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAshaWorkers();
      const actualData = response.data || response || [];
      
      if (Array.isArray(actualData)) {
        setWorkers(actualData);
      } else {
        setWorkers([]);
      }
    } catch (err) {
      console.error("API Error:", err);
      toast.error(t('errors.submitFailed')); // Using translation
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorkers(); }, []);

  /**
   * Search Logic
   */
  const filteredWorkers = workers.filter(w => {
    const name = (w.full_name || "").toLowerCase();
    const village = (w.village || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || village.includes(search);
  });

  /**
   * Individual Registration
   */
  const handleAddWorker = async (e) => {
    e.preventDefault();
    const toastId = toast.loading(t('common.syncing')); // Using translation
    try {
      await adminService.addAshaWorker(formData);
      setIsModalOpen(false);
      setFormData({ full_name: '', username: '', password: '', contact_number: '', village: '' });
      await fetchWorkers();
      toast.success(t('success.registered'), { id: toastId }); // Using translation
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.submitFailed'), { id: toastId });
    }
  };

  /**
   * Bulk CSV Upload
   */
  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error("Please upload a valid CSV file.");
      return;
    }

    const data = new FormData();
    data.append('asha_file', file);

    const toastId = toast.loading(t('common.syncing'));
    try {
      setIsUploading(true);
      const response = await adminService.bulkAddAsha(data);
      const successMsg = response.data?.message || t('success.updated');
      
      toast.success(successMsg, { id: toastId, duration: 5000 });
      fetchWorkers(); 
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.submitFailed'), { id: toastId });
    } finally {
      setIsUploading(false);
      e.target.value = ''; 
    }
  };

  /**
   * Delete Worker
   */
  const handleDelete = async (id, workload) => {
    if (Number(workload) > 0) {
      toast.error(`${t('common.status')}: Worker is managing ${workload} patients.`);
      return;
    }
    
    if (!window.confirm(t('common.cancel'))) return; // Reusing cancel key for confirmation logic
    
    const toastId = toast.loading(t('common.syncing'));
    try {
      await adminService.deleteAshaWorker(id);
      toast.success(t('success.updated'), { id: toastId });
      fetchWorkers();
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.submitFailed'), { id: toastId });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      {/* Toast Configuration */}
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'font-bold text-sm rounded-2xl border-2 border-slate-100 shadow-xl',
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('nav.asha_mgmt')}</h1>
          <p className="text-slate-500 text-sm font-medium">{t('nav.asha_companion')}</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <label className={`
            flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl border-2 border-dashed 
            transition-all cursor-pointer font-bold text-sm
            ${isUploading 
              ? 'bg-slate-50 border-slate-200 text-slate-400' 
              : 'border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/40'}
          `}>
            {isUploading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
            {isUploading ? t('common.syncing') : t('admin.bulk_upload')}
            <input type="file" accept=".csv" className="hidden" onChange={handleBulkUpload} disabled={isUploading} />
          </label>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary-niti !w-auto px-6 shadow-emerald-500/20 flex items-center gap-2"
          >
            <UserPlus size={18} /> {t('admin.register_new')}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative group w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text"
            placeholder={t('cases.search')}
            className="input-niti pl-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
          {t('admin.total_registry')}: {workers.length}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin.personal_info')}</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin.village')}</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('admin.workload')}</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan="4" className="py-24 text-center">
                  <Loader2 className="animate-spin text-primary mx-auto mb-4" size={32} />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('common.loading')}</p>
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
                           {worker.contact_number && (
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
                      <MapPin size={12} className="text-slate-400" /> {worker.village || t('dashboard.pending')}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className={`text-sm font-black ${Number(worker.workload) > 10 ? 'text-orange-500' : 'text-primary'}`}>
                        {worker.workload || 0}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{t('dashboard.assigned')}</span>
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
                    <p className="text-slate-400 font-bold">{t('errors.recordNotFound')}</p>
                    <button onClick={() => setSearchTerm('')} className="text-primary text-xs font-black uppercase mt-2 hover:underline">{t('cases.all')}</button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Logic */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-slate-900/40 backdrop-blur-sm p-4 overflow-hidden">
          <div className="bg-white w-full max-w-lg h-full rounded-[40px] shadow-2xl p-10 overflow-y-auto animate-in slide-in-from-right duration-500 border-l border-white/20">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-glow text-primary rounded-2xl"><ShieldCheck size={28}/></div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t('nav.asha_mgmt')}</h2>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{t('nav.admin_suite')}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"><X /></button>
            </div>

            <form onSubmit={handleAddWorker} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('forms.full_name')}</label>
                <input required className="input-niti bg-slate-50/50" placeholder={t('placeholders.fullName')} value={formData.full_name}
                  onChange={e => setFormData({...formData, full_name: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('forms.govt_id')}</label>
                  <input required className="input-niti bg-slate-50/50 text-sm" placeholder="suman_asha" value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('dashboard.password')}</label>
                  <input required type="password" className="input-niti bg-slate-50/50 text-sm" placeholder="••••••••" value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('forms.contact')}</label>
                <input required className="input-niti bg-slate-50/50" placeholder={t('placeholders.mobile')} value={formData.contact_number}
                  onChange={e => setFormData({...formData, contact_number: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('forms.village')}</label>
                <input required className="input-niti bg-slate-50/50" placeholder={t('placeholders.village')} value={formData.village}
                  onChange={e => setFormData({...formData, village: e.target.value})} />
              </div>

              <div className="pt-6">
                <button type="submit" className="btn-primary-niti py-4 shadow-xl shadow-emerald-500/20 text-base">
                  {t('buttons.confirm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AshaManagement;