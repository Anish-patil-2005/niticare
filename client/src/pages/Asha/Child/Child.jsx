/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { formService } from '../../../api/formService.js';
import { recordService } from '../../../api/recordService.js';
import { 
  ChevronRight, Activity, Edit3, Baby, 
  History, Plus, Clock, LayoutList, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ChildCare = ({ phase = 'child_care' }) => {
  const { id: beneficiaryId } = useParams(); 
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState([]);
  const [expandedFormId, setExpandedFormId] = useState(null);
  const [historyCache, setHistoryCache] = useState({}); 

  const navigate = useNavigate();
  const location = useLocation();
  const isAdminSection = location.pathname.includes('/admin');

  useEffect(() => {
    if (beneficiaryId) loadData();
  }, [beneficiaryId, phase]);

  const loadData = async () => {
    try {
      setLoading(true);
      const fRes = await formService.getDashboardForms(phase, beneficiaryId);
      const fetchedForms = fRes?.data || fRes || [];
      setForms(Array.isArray(fetchedForms) ? fetchedForms : []);
    } catch (err) {
      toast.error(`Failed to load forms`);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchHistory = async (formId) => {
  if (expandedFormId === formId) {
    setExpandedFormId(null);
    return;
  }

  try {
    const res = await recordService.getExistingRecord(beneficiaryId, formId, 0, phase);
    
    // CHANGE THIS LINE:
    // Your console shows 'res' is the array [{}, {}], not { data: [{}, {}] }
    const rawRecords = Array.isArray(res) ? res : (res?.data || []);
    
    console.log("Processed rawRecords:", rawRecords); // This should now show length 2

    const processedRecords = rawRecords.map(rec => ({
      id: rec.id, 
      timestamp: rec.created_at || rec.updated_at, 
      // Handle data whether it's already an object or a JSON string
      data: typeof rec.data === 'string' ? JSON.parse(rec.data) : rec.data,
      month: rec.month_number
    }));

    setHistoryCache(prev => ({ ...prev, [formId]: processedRecords }));
    setExpandedFormId(formId);
  } catch (err) {
    console.error("❌ History Load Error:", err);
    toast.error("Failed to load history table");
  }
};

  const handleNewSubmission = (form) => {
    const prefix = isAdminSection ? '/admin' : '/asha';
    // CLEAN NAVIGATE: No recordId ensures the backend performs an INSERT
    navigate(`${prefix}/fill-form/${form.id}/${beneficiaryId}?month=${form.month_number || 0}&phase=${phase}`);
  };

  const handleEditSubmission = (formId, recordId, month) => {
    const prefix = isAdminSection ? '/admin' : '/asha';
    // EDIT NAVIGATE: Passing recordId ensures backend performs an UPDATE on that specific row
    navigate(`${prefix}/fill-form/${formId}/${beneficiaryId}?month=${month || 0}&recordId=${recordId}&phase=${phase}`);
  };

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center bg-white">
      <Activity className="animate-spin text-emerald-600 mb-2" size={32} />
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Records...</p>
    </div>
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20 font-sans px-4">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-slate-100 mt-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
            <Baby size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">Growth Log</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Independent Entry History</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {forms.map((form) => (
          <div key={form.id} className="bg-white rounded-[1.8rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <LayoutList size={18} />
                </div>
                <h4 className="font-bold text-sm text-slate-700">{form.title}</h4>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleFetchHistory(form.id)}
                  className={`p-2.5 rounded-xl border transition-all ${expandedFormId === form.id ? 'bg-slate-800 text-white' : 'bg-white text-slate-400 border-slate-200'}`}
                >
                  <History size={18} />
                </button>
                <button 
                  onClick={() => handleNewSubmission(form)}
                  className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-md"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {expandedFormId === form.id && (
              <div className="overflow-x-auto border-t border-slate-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Month</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(historyCache[form.id] || []).map((entry) => (
                      <tr key={entry.id} className="hover:bg-emerald-50/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-slate-700">
                              {new Date(entry.timestamp).toLocaleDateString('en-IN')}
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded">
                            M-{entry.month}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button 
                            onClick={() => handleEditSubmission(form.id, entry.id, entry.month)}
                            className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase"
                          >
                            <Edit3 size={12} /> Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};