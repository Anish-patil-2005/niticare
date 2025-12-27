import React, { useState, useRef } from 'react';
import { 
  CloudUpload, FileSpreadsheet, CheckCircle2, 
  AlertCircle, Loader2, Database, ArrowRight, X 
} from 'lucide-react';
import { adminService } from '../../api/adminService';

const DataSync = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus('idle');
    }
  };
const handleSync = async () => {
  if (!file) return;
  setStatus('uploading');

  const formData = new FormData();
  formData.append('govt_file', file);

  try {
    const result = await adminService.syncGovtData(formData);
    
    // Check if result exists at all
    if (!result) {
      throw new Error("No response data received from service");
    }

    // Match exactly what you saw in the console log
    if (result.status === 'success' || result.message) {
      setStatus('success');
      setMessage(result.message || "Sync completed successfully");
      setFile(null);
    }
  } catch (err) {
    console.error("UI Update Error:", err);
    setStatus('error');
    // If result was undefined, this shows "Cannot read properties of undefined"
    setMessage(err.message || "UI failed to process server response");
  }
};
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Data Synchronization</h1>
          <p className="text-slate-500 mt-1 font-medium">Import large-scale beneficiary records from government CSV/Excel files.</p>
        </div>
        <div className="p-3 bg-primary/10 text-primary rounded-2xl shadow-sm">
          <Database size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Upload Zone */}
        <div className="md:col-span-2 space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-[40px] p-12 text-center transition-all cursor-pointer group
              ${file ? 'border-primary bg-primary-glow/10' : 'border-slate-200 bg-white hover:border-primary/50 hover:bg-slate-50'}`}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden" 
              accept=".csv, .xls, .xlsx"
            />
            
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-110 duration-300
              ${file ? 'bg-primary text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 text-slate-400'}`}>
              {status === 'uploading' ? <Loader2 className="animate-spin" size={32} /> : <CloudUpload size={32} />}
            </div>

            {file ? (
              <div className="space-y-2">
                <p className="text-lg font-black text-slate-800 tracking-tight">{file.name}</p>
                <p className="text-xs text-primary font-bold uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to Parse</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="mt-4 text-red-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-bold text-slate-700">Drag & Drop or click to browse</p>
                <p className="text-sm text-slate-400 font-medium">Supports CSV, XLS, XLSX (Max 5MB)</p>
              </div>
            )}
          </div>

          {/* Action Button */}
          {file && status !== 'uploading' && (
            <button 
              onClick={handleSync}
              className="btn-primary-niti py-5 text-lg font-black shadow-xl shadow-emerald-500/20 animate-in zoom-in-95"
            >
              Initialize Sync Sequence <ArrowRight className="ml-2" size={20} />
            </button>
          )}

          {/* Status Messages */}
          {status === 'success' && (
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[28px] flex items-start gap-4 animate-in slide-in-from-top-2">
              <div className="p-2 bg-emerald-500 text-white rounded-full shadow-sm"><CheckCircle2 size={20} /></div>
              <div>
                <p className="text-emerald-900 font-black tracking-tight">Synchronization Successful</p>
                <p className="text-emerald-700 text-sm mt-0.5 font-medium">{message}</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 border border-red-100 p-6 rounded-[28px] flex items-start gap-4 animate-in slide-in-from-top-2">
              <div className="p-2 bg-red-500 text-white rounded-full shadow-sm"><AlertCircle size={20} /></div>
              <div>
                <p className="text-red-900 font-black tracking-tight">Sync Engine Failure</p>
                <p className="text-red-700 text-sm mt-0.5 font-medium">{message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info/Requirements */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[32px] p-8 text-white">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <FileSpreadsheet size={16} /> Data Requirements
            </h3>
            <ul className="space-y-4">
              {[
                { label: 'Beneficiary ID', desc: 'Must be unique (UIDAI/Govt ID)' },
                { label: 'Village Name', desc: 'Required for ASHA allocation' },
                { label: 'Medical Risk', desc: 'Score between 0-10 or High/Low' },
                { label: 'Contact', desc: 'Primary mobile number' }
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold mt-0.5">
                    {i+1}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-100">{item.label}</p>
                    <p className="text-[11px] text-slate-500 leading-tight">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-slate-100 rounded-[32px] p-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Sync Integrity</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              The engine performs an <strong>Upsert</strong> operation. Duplicate IDs will automatically update existing records without creating clones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSync;