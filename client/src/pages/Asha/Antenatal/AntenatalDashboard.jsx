/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { formService } from '../../../api/formService.js';
import { scheduleService } from '../../../api/scheduleService.js';
import { 
  ChevronLeft, Calendar, Clock, 
  ChevronRight, ClipboardList, Activity,
  CheckCircle2, LayoutDashboard, Save, X,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AntenatalDashboard = () => {
  const { id: beneficiaryId } = useParams(); 
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState([]);
  
  // Scheduling States
  const [schedulingId, setSchedulingId] = useState(null); 
  const [selectedDate, setSelectedDate] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const isAdminSection = location.pathname.includes('/admin');

  // Get today's date in YYYY-MM-DD format for the 'min' attribute
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (beneficiaryId) loadData();
  }, [beneficiaryId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const fRes = await formService.getDashboardForms('antenatal', beneficiaryId);
      const fetchedForms = fRes?.data || fRes || [];
      setForms(Array.isArray(fetchedForms) ? fetchedForms : []);
    } catch (err) {
      console.error("Form Load Error:", err);
      toast.error("Failed to load timeline forms");
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

  const handleFormClick = (formId, month) => {
    const prefix = isAdminSection ? '/admin' : '/asha';
    navigate(`${prefix}/fill-form/${formId}/${beneficiaryId}?month=${month}`);
  };

  const getFormsForMonth = (month) => {
    return forms.filter(f => {
      const formMonth = Number(f.month_number);
      const currentMonth = Number(month);
      return formMonth === currentMonth || f.is_recurring === true;
    });
  };

  const isFormDoneInMonth = (form, month) => {
    if (form.completed_months) {
      return form.completed_months.includes(Number(month));
    }
    return !form.is_recurring && form.is_completed;
  };

  const monthSlots = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  let totalTasks = 0;
  let completedTasks = 0;

  monthSlots.forEach(m => {
    const monthlyForms = getFormsForMonth(m);
    totalTasks += monthlyForms.length;
    completedTasks += monthlyForms.filter(f => isFormDoneInMonth(f, m)).length;
  });

  const overallPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center bg-white">
      <Activity className="animate-spin text-emerald-600 mb-2" size={32} />
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Timeline...</p>
    </div>
  );

  return (
    <div className="bg-[#FBFBFB] min-h-screen">
      <div className="px-6 py-8 space-y-8">
        
        {/* --- SUMMARY PROGRESS CARD --- */}
        <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-emerald-100 text-[10px] font-black uppercase tracking-[0.2em]">Overall Progress</p>
                <h2 className="text-3xl font-black">{overallPercentage}%</h2>
              </div>
              <LayoutDashboard className="opacity-40" size={32} />
            </div>
            <div className="w-full bg-emerald-700/50 h-3 rounded-full mb-4">
              <div 
                className="bg-white h-full rounded-full transition-all duration-1000" 
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
            <p className="text-xs font-bold text-emerald-50">
              {completedTasks} of {totalTasks} Month-wise Assessments Completed
            </p>
          </div>
        </div>

        {/* --- MONTHLY TIMELINE --- */}
        <div className="grid grid-cols-1 gap-8">
          {monthSlots.map((m) => {
            const monthlyForms = getFormsForMonth(m);
            const formsDoneThisMonth = monthlyForms.filter(f => isFormDoneInMonth(f, m));
            const completedCount = formsDoneThisMonth.length;
            const isMonthFullyDone = monthlyForms.length > 0 && completedCount === monthlyForms.length;

            return (
              <div key={m} className="relative">
                {m < 9 && <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-slate-100 -mb-8 z-0" />}
                
                <div className={`relative z-10 bg-white rounded-[2.5rem] border ${isMonthFullyDone ? 'border-emerald-100 shadow-emerald-50' : 'border-slate-100 shadow-sm'} overflow-hidden`}>
                  <div className={`p-6 border-b flex items-center justify-between ${isMonthFullyDone ? 'bg-emerald-50/30 border-emerald-50' : 'bg-slate-50/50 border-slate-50'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center font-black text-xl border ${isMonthFullyDone ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-600 border-emerald-100'}`}>
                        {isMonthFullyDone ? <CheckCircle2 size={24} /> : m}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 text-lg tracking-tight">Month {m}</h3>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isMonthFullyDone ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {completedCount} / {monthlyForms.length} Tasks Done
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    {monthlyForms.map((form) => {
                      const isDone = isFormDoneInMonth(form, m);
                      const isPlanning = schedulingId === `${m}-${form.id}`;
                      
                      // Check for Missed Status
                      const isMissed = !isDone && form.planned_date && new Date(form.planned_date) < new Date().setHours(0,0,0,0);

                      return (
                        <div key={`${m}-${form.id}`} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleFormClick(form.id, m)}
                              className={`flex-1 group flex items-center justify-between p-4 rounded-[1.5rem] border transition-all text-left 
                                ${isDone 
                                  ? 'bg-emerald-50/20 border-emerald-100' 
                                  : isMissed 
                                    ? 'bg-rose-50 border-rose-200 shadow-sm shadow-rose-100' 
                                    : 'bg-white border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30'}`}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl transition-colors 
                                  ${isDone ? 'bg-emerald-100 text-emerald-600' 
                                    : isMissed ? 'bg-rose-100 text-rose-600' 
                                    : 'bg-slate-50 text-slate-400 group-hover:text-emerald-500'}`}>
                                  {isDone ? <CheckCircle2 size={20} /> 
                                    : isMissed ? <AlertCircle size={20} className="animate-pulse" /> 
                                    : <ClipboardList size={20} />}
                                </div>
                                <div>
                                  <span className={`block text-sm font-black uppercase tracking-tight 
                                    ${isDone ? 'text-emerald-900' : isMissed ? 'text-rose-900' : 'text-slate-700'}`}>
                                    {form.title}
                                  </span>
                                  <div className="flex flex-col gap-0.5 mt-0.5">
                                    <span className={`text-[9px] font-bold uppercase ${isDone ? 'text-emerald-500' : isMissed ? 'text-rose-500' : 'text-slate-400'}`}>
                                      {isDone ? 'Edit' : isMissed ? 'Missed Visit - Record Now' : 'Start'} Assessment
                                    </span>
                                    {form.planned_date && !isDone && (
                                      <span className={`text-[9px] font-black flex items-center gap-1 uppercase ${isMissed ? 'text-rose-600' : 'text-indigo-600'}`}>
                                        <Calendar size={10} /> {isMissed ? 'Expired' : 'Planned'}: {new Date(form.planned_date).toLocaleDateString('en-IN', {day:'2-digit', month:'short'})}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <ChevronRight size={18} className={isDone ? 'text-emerald-300' : isMissed ? 'text-rose-300' : 'text-slate-300'} />
                            </button>

                            {!isDone && !isAdminSection && (
                              <button 
                                onClick={() => setSchedulingId(isPlanning ? null : `${m}-${form.id}`)}
                                className={`p-4 rounded-2xl border transition-all ${isPlanning ? 'bg-rose-50 text-rose-500 border-rose-100' : isMissed ? 'bg-rose-100 border-rose-200 text-rose-600' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                              >
                                {isPlanning ? <X size={20} /> : <Calendar size={20} />}
                              </button>
                            )}
                          </div>

                          {isPlanning && (
                            <div className="flex items-center gap-2 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 animate-in slide-in-from-top-2">
                              <input 
                                type="date" 
                                min={todayStr} // Prevents selecting back-dated visits
                                className="flex-1 bg-white border border-indigo-200 rounded-xl p-2 text-xs font-bold outline-none"
                                onChange={(e) => setSelectedDate(e.target.value)}
                              />
                              <button 
                                onClick={() => handleScheduleSave(form.id)}
                                className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-100"
                              >
                                <Save size={18} />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};