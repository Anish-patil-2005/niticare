/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { formService } from '../../../api/formService.js';
import { scheduleService } from '../../../api/scheduleService.js';
import { 
  ChevronRight, ClipboardList, Activity,
  CheckCircle2, Baby, HeartPulse, ShieldCheck,
  Calendar, Save, X, AlertCircle, Scale, Syringe, Trophy
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ChildCare = ({ phase = 'child_care' }) => {
  const { id: beneficiaryId } = useParams(); 
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState([]);
  
  // Scheduling States
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
      const fRes = await formService.getDashboardForms(phase, beneficiaryId);
      const fetchedForms = fRes?.data || fRes || [];
      setForms(Array.isArray(fetchedForms) ? fetchedForms : []);
    } catch (err) {
      console.error("Load Error:", err);
      toast.error(`Failed to load ${phase} forms`);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSave = async (formId) => {
    if (!selectedDate) return toast.error("Select a date");
    try {
      await scheduleService.planVisit(beneficiaryId, formId, selectedDate);
      toast.success("Visit Scheduled");
      setSchedulingId(null);
      loadData(); 
    } catch (err) {
      toast.error("Failed to schedule");
    }
  };

  const handleFormClick = (formId) => {
    const prefix = isAdminSection ? '/admin' : '/asha';
    navigate(`${prefix}/fill-form/${formId}/${beneficiaryId}?month=0`);
  };

  const getFormIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes('growth') || t.includes('weight')) return <Scale size={18} />;
    if (t.includes('vaccin') || t.includes('immun')) return <Syringe size={18} />;
    if (t.includes('milestone') || t.includes('develop')) return <Trophy size={18} />;
    return <ClipboardList size={18} />;
  };

  const completedCount = forms.filter(f => f.completed_months?.length > 0 || f.is_completed).length;
  const progressPercent = forms.length > 0 ? Math.round((completedCount / forms.length) * 100) : 0;

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center bg-white">
      <Activity className="animate-spin text-indigo-600 mb-2" size={32} />
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Syncing Child Records...</p>
    </div>
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20">
      {/* --- PHASE HEADER --- */}
      <div className="bg-white px-6 py-8 border-b border-slate-100 shadow-sm mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
            <Baby size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 capitalize">Child Care</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              0 — 5 Years Growth & Health
            </p>
          </div>
        </div>

        {/* --- PROGRESS BAR --- */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">Total Milestones Achieved</span>
            <span className="text-sm font-black text-slate-700">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(79,70,229,0.3)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* --- FORM LIST (SEQUENTIAL) --- */}
      <div className="px-6 space-y-6 relative">
        <div className="absolute left-[2.75rem] top-4 bottom-4 w-0.5 bg-slate-100 z-0" />

        {forms.length > 0 ? forms.map((form, index) => {
          const isDone = form.completed_months?.length > 0 || form.is_completed;
          const isPlanning = schedulingId === form.id;
          const isMissed = !isDone && form.planned_date && new Date(form.planned_date) < new Date().setHours(0,0,0,0);
          
          return (
            <div key={form.id} className="relative z-10 space-y-2">
              <div className="flex items-start gap-4">
                {/* Step / Status Icon */}
                <div className={`mt-2 w-10 h-10 rounded-xl flex items-center justify-center border-2 shrink-0 transition-all shadow-sm
                  ${isDone 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : isMissed 
                      ? 'bg-rose-500 border-rose-500 text-white animate-pulse'
                      : 'bg-white border-slate-200 text-slate-400'}`}>
                  {isDone ? <CheckCircle2 size={18} /> : isMissed ? <AlertCircle size={18} /> : <span className="text-xs font-black">{index + 1}</span>}
                </div>

                {/* Form Content Card */}
                <div className="flex-1 flex gap-2">
                  <button
                    onClick={() => handleFormClick(form.id)}
                    className={`flex-1 p-5 rounded-[1.8rem] border text-left transition-all active:scale-[0.98]
                      ${isDone 
                        ? 'bg-white border-emerald-100 shadow-sm shadow-emerald-50' 
                        : isMissed
                          ? 'bg-rose-50 border-rose-200'
                          : 'bg-white border-slate-100 hover:border-indigo-200'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`${isDone ? 'text-emerald-500' : isMissed ? 'text-rose-500' : 'text-indigo-400'}`}>
                            {getFormIcon(form.title)}
                          </span>
                          <h4 className={`font-black text-sm uppercase tracking-tight
                            ${isDone ? 'text-slate-800' : isMissed ? 'text-rose-900' : 'text-slate-700'}`}>
                            {form.title}
                          </h4>
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          <p className={`text-[10px] font-bold uppercase tracking-widest ${isMissed ? 'text-rose-400' : 'text-slate-400'}`}>
                            {isDone ? 'Record Completed' : isMissed ? 'Overdue - Immediate Action' : 'Scheduled Assessment'}
                          </p>
                          
                          {form.planned_date && !isDone && (
                            <span className={`text-[10px] font-black flex items-center gap-1 uppercase ${isMissed ? 'text-rose-600' : 'text-indigo-600'}`}>
                              <Calendar size={12} /> {isMissed ? 'Was Due' : 'Planned'}: {new Date(form.planned_date).toLocaleDateString('en-IN', {day:'2-digit', month:'short'})}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={18} className={isDone ? 'text-emerald-300' : isMissed ? 'text-rose-300' : 'text-slate-300'} />
                    </div>
                  </button>

                  {/* Scheduling Toggle */}
                  {!isDone && !isAdminSection && (
                    <button 
                      onClick={() => setSchedulingId(isPlanning ? null : form.id)}
                      className={`p-4 rounded-2xl border transition-all ${isPlanning ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-100 shadow-sm'}`}
                    >
                      {isPlanning ? <X size={20} /> : <Calendar size={20} />}
                    </button>
                  )}
                </div>
              </div>

              {/* Inline Date Picker */}
              {isPlanning && (
                <div className="ml-14 flex items-center gap-2 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 animate-in slide-in-from-top-2">
                  <input 
                    type="date" 
                    min={todayStr}
                    className="flex-1 bg-white border border-indigo-200 rounded-xl p-2 text-xs font-bold outline-none"
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                  <button 
                    onClick={() => handleScheduleSave(form.id)}
                    className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg"
                  >
                    <Save size={18} />
                  </button>
                </div>
              )}
            </div>
          );
        }) : (
          <div className="py-20 text-center">
            <ClipboardList className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-sm font-bold text-slate-400 uppercase">Waiting for phase activation</p>
          </div>
        )}
      </div>
    </div>
  );
};