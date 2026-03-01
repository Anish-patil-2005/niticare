import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CloudUpload, FileSpreadsheet, CheckCircle2, 
  AlertCircle, Loader2, Database, ArrowRight, X, Zap 
} from 'lucide-react';
import { adminService } from '../../api/adminService';
import toast from 'react-hot-toast';

const DataSync = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); 
  const [message, setMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const requirements = [
    { label: "Woman ID", icon: "🆔" },
    { label: "Name", icon: "👤" },
    { label: "Age", icon: "🎂" },
    { label: "Phone", icon: "📞" },
    { label: "EDD", icon: "📅" },
    { label: "District", icon: "📍" },
    { label: "Village", icon: "🏡" },
    { label: "Medical History", icon: "🏥" }
  ];

  const handleSync = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('govt_file', file);
    const toastId = toast.loading(t('common.syncing'));

    try {
      setStatus('uploading');
      setUploadProgress(15);
      const result = await adminService.syncGovtData(formData);
      setUploadProgress(45);
      
      const interval = setInterval(() => {
        setUploadProgress(prev => (prev >= 92 ? 92 : prev + 2));
      }, 300);

      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(100);
        setStatus('success');
        setMessage(result.message);
        toast.success(t('success.updated'), { id: toastId });
        setFile(null);
        setTimeout(() => setUploadProgress(0), 3000);
      }, 4000);
    } catch (err) {
      setStatus('error');
      setUploadProgress(0);
      setMessage(err.message);
      toast.error(t('errors.submitFailed'), { id: toastId });
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('sync.title')}</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">{t('sync.subtitle')}</p>
        </div>
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner">
          <Database size={24} />
        </div>
      </div>

      {/* 1. Progress Bar Section */}
      {uploadProgress > 0 && (
        <div className="bg-white border border-emerald-100 rounded-3xl p-5 shadow-sm animate-in zoom-in-95">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Background Sync Active
            </span>
            <span className="text-xs font-bold text-emerald-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-emerald-50 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* 2. Main Upload Section */}
      <div className="space-y-6">
        <div 
          onClick={() => status !== 'uploading' && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-[48px] p-12 md:p-20 text-center transition-all cursor-pointer group
            ${file ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 bg-white hover:border-emerald-400 hover:bg-slate-50'}
            ${status === 'uploading' ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input type="file" ref={fileInputRef} onChange={(e) => {
            const f = e.target.files[0];
            if(f) { setFile(f); setStatus('idle'); }
          }} className="hidden" accept=".csv" />
          
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-all duration-500
            ${file ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
            {status === 'uploading' ? <Loader2 className="animate-spin" size={32} /> : <CloudUpload size={32} />}
          </div>

          {file ? (
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800">{file.name}</h3>
              <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">Ready to Import</p>
              <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-slate-400 hover:text-red-500 flex items-center gap-1 mx-auto text-xs font-bold mt-4">
                <X size={14} /> {t('common.remove')}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-lg font-bold text-slate-700">{t('sync.drag_drop')}</p>
              <p className="text-sm text-slate-400">{t('sync.supports')}</p>
            </div>
          )}
        </div>

        {file && status !== 'uploading' && (
          <button 
            onClick={handleSync}
            className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-3xl text-lg font-black flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-slate-200"
          >
            <Zap size={20} className="text-emerald-400" fill="currentColor" />
            {t('sync.init_button')} <ArrowRight size={20} />
          </button>
        )}

        {status === 'success' && (
          <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl flex items-center gap-4 animate-in slide-in-from-top-2">
            <CheckCircle2 className="text-emerald-500" size={24} />
            <p className="text-emerald-900 font-bold text-sm">{message}</p>
          </div>
        )}
      </div>

      {/* 3. Bottom Requirements Grid (2 Rows x 4 Columns) */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">
          Required CSV Structure
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {requirements.map((item, i) => (
            <div key={i} className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 hover:border-emerald-200 transition-colors group">
              <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{item.label}</span>
            </div>
          ))}
        </div>
        
        {/* Footer Note */}
        <div className="bg-slate-900 text-white/50 text-[10px] p-4 rounded-2xl text-center font-medium italic">
          Note: Ensure date formats are <span className="text-emerald-400">YYYY-MM-DD</span>. Duplicate "Woman IDs" will be automatically updated with the latest CSV data.
        </div>
      </div>
    </div>
  );
};

export default DataSync;