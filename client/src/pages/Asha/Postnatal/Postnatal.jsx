/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Added
import { formService } from '../../../api/formService.js';
import { recordService } from '../../../api/recordService.js';
import { scheduleService } from '../../../api/scheduleService.js';
import { 
  ChevronRight, Activity, CheckCircle2, 
  Baby, HeartPulse, Weight, Calendar, User, Save, X, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Postnatal = () => {
  const { t } = useTranslation(); // Initialize hook
  const { id: beneficiaryId } = useParams(); 
  const location = useLocation();
  const navigate = useNavigate();
  const phase = location.pathname.includes('child') ? 'child' : 'postnatal';

  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState([]);
  const [records, setRecords] = useState([]); 
  
  const [schedulingId, setSchedulingId] = useState(null); 
  const [selectedDate, setSelectedDate] = useState('');

  const isAdminSection = location.pathname.includes('/admin');
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (beneficiaryId) loadData();
  }, [beneficiaryId, phase]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await formService.getDashboardForms(phase, beneficiaryId);
      const fetchedForms = Array.isArray(res) ? res : (res?.data || []);
      setForms(fetchedForms);

      const regForm = fetchedForms.find(f => 
        f.title && f.title.toLowerCase().includes("registration")
      );
      
      if (regForm && beneficiaryId) {
        const recordRes = await recordService.getExistingRecord(beneficiaryId, regForm.id, 0);
        if (recordRes && recordRes.data) {
          setRecords([{ 
            schema: regForm.schema, 
            data: recordRes.data.data || recordRes.data 
          }]);
        }
      }
    } catch (err) {
      console.error("Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSave = async (formId) => {
    if (!selectedDate) return toast.error(t('postnatal.select_date'));
    try {
      await scheduleService.planVisit(beneficiaryId, formId, selectedDate);
      toast.success(t('success.updated'));
      setSchedulingId(null);
      loadData(); 
    } catch (err) {
      toast.error(t('errors.submitFailed'));
    }
  };

  const babySummary = useMemo(() => {
    if (!records || records.length === 0) {
      return { name: t('postnatal.pending_registration'), dob: null, gender: t('postnatal.not_set'), birthWeight: 0, currentWeight: 0 };
    }
    const reg = records[0]; 
    let values = {};
    try {
      if (reg?.data) {
        values = typeof reg.data === 'string' ? JSON.parse(reg.data) : reg.data;
        if (typeof values === 'string') values = JSON.parse(values);
      }
    } catch (e) { values = {}; }

    const findValueByAttribute = (keywords) => {
      if (!reg.schema || !Array.isArray(reg.schema)) return null;
      const attribute = reg.schema.find(attr => 
        attr && attr.name && keywords.some(key => attr.name.toLowerCase().includes(key))
      );
      return (attribute && values) ? values[attribute.name] : null;
    };

    const bWeight = parseFloat(findValueByAttribute(['weight', 'kg'])) || 0;
    return {
      name: findValueByAttribute([ 'babys_full_name']) || t('postnatal.pending_registration'),
      dob: findValueByAttribute(['dob', 'date_of_birth', 'birth_date']),
      gender: findValueByAttribute(['gender', 'sex']) || t('postnatal.not_set'),
      birthWeight: bWeight,
      currentWeight: bWeight 
    };
  }, [records, t]);

  const babyAgeWeeks = useMemo(() => {
    if (!babySummary.dob) return `0 ${t('postnatal.weeks')}`;
    const diff = Math.abs(new Date() - new Date(babySummary.dob));
    const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
    return `${weeks} ${t('postnatal.weeks')}`;
  }, [babySummary.dob, t]);

  const handleFormClick = (formId) => {
    const prefix = isAdminSection ? '/admin' : '/asha';
    navigate(`${prefix}/fill-form/${formId}/${beneficiaryId}?month=0`);
  };

  const completedCount = forms.filter(f => f.completed_months?.length > 0 || f.is_completed).length;
  const progressPercent = forms.length > 0 ? Math.round((completedCount / forms.length) * 100) : 0;

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center">
      <Activity className="animate-spin text-indigo-600 mb-2" />
      <p className="text-xs font-bold text-slate-400 uppercase">{t('postnatal.syncing')}</p>
    </div>
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20">
      {/* --- HEADER --- */}
      <div className="bg-indigo-600 px-6 pt-10 pb-24 rounded-b-[3.5rem] shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                <HeartPulse className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black text-white uppercase">{t('postnatal.postnatal')}</h1>
                <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest">{t('postnatal.live_summary')}</p>
              </div>
            </div>
            <div className="bg-emerald-400/20 px-4 py-2 rounded-xl border border-emerald-400/30">
                <span className="text-[10px] font-black text-emerald-300 uppercase">{t('postnatal.age')}: {babyAgeWeeks}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/10">
              <p className="text-[9px] font-black text-indigo-100 uppercase mb-1">{t('postnatal.latest_weight')}</p>
              <h3 className="text-2xl font-black text-white">{babySummary.currentWeight} kg</h3>
            </div>
            <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/10">
              <p className="text-[9px] font-black text-indigo-100 uppercase mb-1">{t('postnatal.weight_gain')}</p>
              <h3 className="text-2xl font-black text-white">
                 +{(babySummary.currentWeight - babySummary.birthWeight).toFixed(1)} kg
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-12 space-y-6 relative z-20">
        {/* --- CHILD PROFILE CARD --- */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-50">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600"><Baby size={20} /></div>
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t('postnatal.child_details')}</h4>
               </div>
               <div className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">
                  {babySummary.gender}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
               <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">{t('postnatal.name')}</p>
                  <p className="text-sm font-black text-slate-800 uppercase truncate">{babySummary.name}</p>
               </div>
               <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">{t('postnatal.dob')}</p>
                  <p className="text-sm font-black text-slate-800">{babySummary.dob || t('postnatal.not_set')}</p>
               </div>
            </div>
        </div>

        {/* --- TIMELINE --- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{t('postnatal.checklist')}</h4>
            <span className="text-[10px] font-black text-indigo-600 uppercase">{progressPercent}% {t('postnatal.done')}</span>
          </div>

          <div className="space-y-3">
            {forms.map((form, index) => {
              const isDone = form.completed_months?.length > 0 || form.is_completed;
              const isPlanning = schedulingId === form.id;
              const isMissed = !isDone && form.planned_date && new Date(form.planned_date) < new Date().setHours(0,0,0,0);

              return (
                <div key={form.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleFormClick(form.id)}
                      className={`flex-1 flex items-center gap-4 p-4 rounded-[1.5rem] border transition-all ${
                        isDone ? 'bg-emerald-50 border-emerald-100' : isMissed ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-100'
                      } shadow-sm`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 
                        ${isDone ? 'bg-emerald-500 text-white' : isMissed ? 'bg-rose-500 text-white' : 'bg-slate-50 text-slate-300'}`}>
                        {isDone ? <CheckCircle2 size={18} /> : isMissed ? <AlertCircle size={18} className="animate-pulse" /> : <span className="text-xs font-black">{index + 1}</span>}
                      </div>
                      <div className="flex-1 text-left">
                        <h5 className={`text-[11px] font-black uppercase ${isDone ? 'text-emerald-900' : isMissed ? 'text-rose-900' : 'text-slate-500'}`}>
                          {form.title}
                        </h5>
                        {form.planned_date && !isDone && (
                           <p className={`text-[8px] font-black uppercase mt-0.5 ${isMissed ? 'text-rose-500' : 'text-indigo-500'}`}>
                             {isMissed ? t('postnatal.missed') : t('postnatal.planned')}: {new Date(form.planned_date).toLocaleDateString('en-IN', {day:'2-digit', month:'short'})}
                           </p>
                        )}
                      </div>
                      <ChevronRight size={16} className={isDone ? 'text-emerald-300' : 'text-slate-300'} />
                    </button>

                    {!isDone && !isAdminSection && (
                      <button 
                        onClick={() => setSchedulingId(isPlanning ? null : form.id)}
                        className={`p-4 rounded-2xl border transition-all ${isPlanning ? 'bg-indigo-100 text-indigo-600 border-indigo-200' : 'bg-white text-slate-400 border-slate-100'}`}
                      >
                        {isPlanning ? <X size={20} /> : <Calendar size={20} />}
                      </button>
                    )}
                  </div>

                  {isPlanning && (
                    <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-2xl border border-indigo-100 mx-2">
                      <input 
                        type="date" 
                        min={todayStr}
                        className="flex-1 bg-white border border-indigo-200 rounded-xl p-2 text-xs font-bold outline-none"
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                      <button 
                        onClick={() => handleScheduleSave(form.id)}
                        className="bg-indigo-600 text-white p-2 rounded-xl"
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
    </div>
  );
};