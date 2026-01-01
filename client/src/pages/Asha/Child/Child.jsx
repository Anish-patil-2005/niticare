/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { formService } from '../../../api/formService.js';
import { scheduleService } from '../../../api/scheduleService.js';
import { 
  ChevronRight, ClipboardList, Activity,
  CheckCircle2, Baby, Calendar, Save, X, AlertCircle, Scale, Syringe, Trophy
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ChildCare = ({ phase = 'child_care' }) => {
  const { id: beneficiaryId } = useParams(); 
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState([]);
  const [schedulingId, setSchedulingId] = useState(null); 
  const [selectedDate, setSelectedDate] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const isAdminSection = location.pathname.includes('/admin');
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (beneficiaryId) loadData();
  }, [beneficiaryId, phase]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Ensure the API call passes the phase correctly
      const fRes = await formService.getDashboardForms(phase, beneficiaryId);
      const fetchedForms = fRes?.data || fRes || [];
      
      // Fix: Filter or map forms to ensure we have valid month data
      setForms(Array.isArray(fetchedForms) ? fetchedForms : []);
    } catch (err) {
      console.error("Load Error:", err);
      toast.error(`Failed to load child care forms`);
    } finally {
      setLoading(false);
    }
  };

  const handleFormClick = (form) => {
    const prefix = isAdminSection ? '/admin' : '/asha';
    // FIX: Instead of hardcoded month=0, we use the month specified in the form plan
    // or the child's current age month if available.
    const targetMonth = form.current_target_month || 0;
    navigate(`${prefix}/fill-form/${form.id}/${beneficiaryId}?month=${targetMonth}`);
  };

  const getFormIcon = (title) => {
    const t = title?.toLowerCase() || '';
    if (t.includes('growth') || t.includes('weight')) return <Scale size={18} />;
    if (t.includes('vaccin') || t.includes('immun')) return <Syringe size={18} />;
    if (t.includes('milestone') || t.includes('develop')) return <Trophy size={18} />;
    return <ClipboardList size={18} />;
  };

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center bg-white">
      <Activity className="animate-spin text-indigo-600 mb-2" size={32} />
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Syncing Child Records...</p>
    </div>
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20">
      <div className="bg-white px-6 py-8 border-b border-slate-100 shadow-sm mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
            <Baby size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 capitalize">Child Care</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">0 — 5 Years Growth & Health</p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6 relative">
        {/* Timeline vertical line */}
        {forms.length > 0 && (
            <div className="absolute left-[2.75rem] top-4 bottom-4 w-0.5 bg-slate-100 z-0" />
        )}

        {forms.length > 0 ? forms.map((form, index) => {
          const isDone = form.completed_months?.length > 0 || form.is_completed;
          const isPlanning = schedulingId === form.id;
          const isMissed = !isDone && form.planned_date && new Date(form.planned_date) < new Date().setHours(0,0,0,0);
          
          return (
            <div key={form.id} className="relative z-10">
              <div className="flex items-start gap-4">
                <div className={`mt-2 w-10 h-10 rounded-xl flex items-center justify-center border-2 shrink-0 transition-all shadow-sm
                  ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' 
                  : isMissed ? 'bg-rose-500 border-rose-500 text-white animate-pulse'
                  : 'bg-white border-slate-200 text-slate-400'}`}>
                  {isDone ? <CheckCircle2 size={18} /> : isMissed ? <AlertCircle size={18} /> : <span className="text-xs font-black">{index + 1}</span>}
                </div>

                <div className="flex-1 flex gap-2">
                  <button
                    onClick={() => handleFormClick(form)}
                    className={`flex-1 p-5 rounded-[1.8rem] border text-left transition-all active:scale-[0.98]
                      ${isDone ? 'bg-white border-emerald-100 shadow-sm' : isMissed ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-100'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className={isDone ? 'text-emerald-500' : isMissed ? 'text-rose-500' : 'text-indigo-400'}>
                            {getFormIcon(form.title)}
                          </span>
                          <h4 className="font-black text-sm uppercase tracking-tight text-slate-700">{form.title}</h4>
                        </div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">
                           {/* Show which month this assessment is for */}
                           {form.month_number ? `Month ${form.month_number}` : 'Ongoing Assessment'}
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-slate-300" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="py-20 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
            <ClipboardList className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-sm font-bold text-slate-400 uppercase">No active forms for this child</p>
            <p className="text-[10px] text-slate-300 px-10 mt-2 uppercase">Forms appear based on the child's age (Months 0-60)</p>
          </div>
        )}
      </div>
    </div>
  );
};