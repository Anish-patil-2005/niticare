import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ashaLogService from '../../api/ashalogService.js';
import {AshaLogTable} from './AshaLogTable.jsx';
import { useTranslation } from 'react-i18next';
import { ClipboardList } from 'lucide-react';

export const AshaLogsPage = () => {
  const { id } = useParams(); // ID from /admin/ashalog/:id
  const { t } = useTranslation();
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetch = async () => {
    setLoading(true);
    try {
      const result = await ashaLogService.getLogs(id); 
      
      // Look closely at your API result: The array is inside a key called 'data'
      // result.data is the array we need.
      const actualLogs = result?.data || [];
      
      setLogs(actualLogs);
    } catch (error) {
      console.error("Fetch Error:", error);
      setLogs([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };
  fetch();
}, [id]);

 
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-600 rounded-lg shadow-lg shadow-emerald-200">
              <ClipboardList className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                {id ? t('nav.worker_performance') : t('nav.activity_logs')}
              </h1>
              <p className="text-slate-500 font-medium">
                {t('common.tracking_subtitle')}
              </p>
            </div>
          </div>
        </header>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Visits</p>
            <p className="text-3xl font-black text-blue-600">{logs.length}</p>
          </div>
          <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Completed</p>
            <p className="text-3xl font-black text-emerald-600">
              {logs.filter(l => l.status === 'Completed').length}
            </p>
          </div>
          <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Alerts</p>
            <p className="text-3xl font-black text-rose-600">
              {logs.filter(l => l.isAlert).length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <AshaLogTable logs={logs} loading={loading} />
        </div>
      </div>
    </div>
  );
};