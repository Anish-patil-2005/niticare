/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { formService } from '../../../api/formService.js';
import { scheduleService } from '../../../api/scheduleService.js';
import { 
  ChevronRight, ClipboardList, Activity,
  CheckCircle2, LayoutDashboard, Calendar, Save, X,
  AlertCircle, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AntenatalDashboard = () => {
  const { id: beneficiaryId } = useParams(); 
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState([]);
  const [schedules, setSchedules] = useState([]); // Store planned visits
  const [schedulingId, setSchedulingId] = useState(null); 
  const [selectedDate, setSelectedDate] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const isAdminSection = location.pathname.includes('/admin');
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (beneficiaryId) loadData();
  }, [beneficiaryId]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch forms and schedules in parallel
      const [fRes, sRes] = await Promise.all([
        formService.getDashboardForms('antenatal', beneficiaryId),
        scheduleService.getSchedulesByBeneficiary(beneficiaryId)
      ]);

      const fetchedForms = fRes?.data || fRes || [];
      const fetchedSchedules = sRes?.data || sRes || [];

      setForms(Array.isArray(fetchedForms) ? fetchedForms : []);
      setSchedules(Array.isArray(fetchedSchedules) ? fetchedSchedules : []);
    } catch (err) {
      toast.error("Failed to load timeline data");
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
      setSelectedDate('');
      loadData(); // Re-fetch to show the new date badge
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
      const currentMonth = Number(month);
      if (f.is_recurring) return true;
      if (Array.isArray(f.month_number)) return f.month_number.includes(currentMonth);
      return Number(f.month_number) === currentMonth;
    });
  };

  const isFormDoneInMonth = (form, month) => {
    if (form.completed_months) return form.completed_months.includes(Number(month));
    return !form.is_recurring && form.is_completed;
  };

  const monthSlots = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  
  // Progress Calculations
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
      <div className="px-6 py-8 space-y-8 max-w-7xl mx-auto">
        
        {/* --- SUMMARY PROGRESS CARD --- */}
        <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <p className="text-emerald-100 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Pregnancy Progress</p>
              <h2 className="text-4xl font-black mb-4">{overallPercentage}%</h2>
              <div className="w-full bg-emerald-700/50 h-3 rounded-full mb-3">
                <div 
                  className="bg-white h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${overallPercentage}%` }}
                />
              </div>
              <p className="text-xs font-bold text-emerald-50 opacity-80 uppercase tracking-wider">
                {completedTasks} of {totalTasks} Month-wise Tasks Finished
              </p>
            </div>
            <LayoutDashboard className="hidden md:block opacity-20" size={100} />
          </div>
        </div>

        {/* --- MONTHLY GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {monthSlots.map((m) => {
            const monthlyForms = getFormsForMonth(m);
            const completedCount = monthlyForms.filter(f => isFormDoneInMonth(f, m)).length;
            const isMonthFullyDone = monthlyForms.length > 0 && completedCount === monthlyForms.length;

            return (
              <div key={m} className={`flex flex-col bg-white rounded-[2rem] border transition-all duration-300 hover:shadow-lg ${isMonthFullyDone ? 'border-emerald-100' : 'border-slate-100'}`}>
                {/* Month Header */}
                <div className={`p-5 flex items-center gap-4 rounded-t-[2rem] ${isMonthFullyDone ? 'bg-emerald-50/50' : 'bg-slate-50/50'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg border-2 ${isMonthFullyDone ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-600 border-emerald-100'}`}>
                    {isMonthFullyDone ? <CheckCircle2 size={20} /> : m}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-md uppercase tracking-tight">Month {m}</h3>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${isMonthFullyDone ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {completedCount}/{monthlyForms.length} COMPLETED
                    </span>
                  </div>
                </div>

                {/* Forms List */}
                <div className="p-4 flex-1 space-y-3">
                  {monthlyForms.map((form) => {
                    const isDone = isFormDoneInMonth(form, m);
                    const isPlanning = schedulingId === `${m}-${form.id}`;
                    
                    // Match schedule from state
                    const activeSched = schedules.find(s => s.form_id === form.id && s.status === 'planned');
                    const displayDate = activeSched?.scheduled_date;
                    const isMissed = !isDone && displayDate && new Date(displayDate) < new Date().setHours(0,0,0,0);

                    return (
                      <div key={`${m}-${form.id}`} className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => handleFormClick(form.id, m)}
                            className={`flex-1 flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left group
                              ${isDone ? 'bg-emerald-50/20 border-emerald-100' 
                              : isMissed ? 'bg-rose-50 border-rose-100' 
                              : 'bg-white border-slate-50 hover:border-emerald-200 shadow-sm'}`}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                               <div className={`${isDone ? 'text-emerald-500' : isMissed ? 'text-rose-500' : 'text-slate-300'}`}>
                                 {isDone ? <CheckCircle2 size={16} /> : <ClipboardList size={16} />}
                               </div>
                               <div className="flex flex-col">
                                 <span className={`text-[11px] font-bold uppercase truncate tracking-tighter ${isDone ? 'text-emerald-900' : 'text-slate-700'}`}>
                                   {form.title}
                                 </span>
                                 {/* DATE BADGE */}
                                 {!isDone && displayDate && (
                                   <span className={`text-[9px] font-black flex items-center gap-1 mt-0.5 ${isMissed ? 'text-rose-600 animate-pulse' : 'text-indigo-600'}`}>
                                     <Calendar size={10} />
                                     {isMissed ? 'MISSED: ' : 'PLAN: '}{new Date(displayDate).toLocaleDateString('en-IN')}
                                   </span>
                                 )}
                               </div>
                            </div>
                            <ChevronRight size={14} className="text-slate-300 shrink-0" />
                          </button>

                          {!isDone && !isAdminSection && (
                            <button 
                              onClick={() => setSchedulingId(isPlanning ? null : `${m}-${form.id}`)}
                              className={`p-3.5 rounded-2xl border transition-all ${isPlanning ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border-slate-100 shadow-sm'}`}
                            >
                              <Calendar size={16} />
                            </button>
                          )}
                        </div>

                        {/* Inline Scheduler */}
                        {isPlanning && (
                          <div className="flex flex-col gap-2 p-3 bg-indigo-50 rounded-xl animate-in fade-in zoom-in duration-200">
                            <label className="text-[9px] font-black text-indigo-400 uppercase ml-1">Select Visit Date</label>
                            <input 
                              type="date" 
                              min={todayStr}
                              className="w-full bg-white border border-indigo-100 rounded-lg p-2 text-[10px] font-bold outline-none"
                              onChange={(e) => setSelectedDate(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleScheduleSave(form.id)}
                                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-2"
                              >
                                <Save size={12} /> Save
                              </button>
                              <button 
                                onClick={() => setSchedulingId(null)}
                                className="px-3 bg-white text-slate-400 py-2 rounded-lg border border-slate-200"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};