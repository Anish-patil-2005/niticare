/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ashaService } from '../../api/ashaService';
import { 
  ChevronLeft, User, MapPin, Calendar, 
  Phone, Save, AlertCircle, Loader2, 
  Sparkles, Activity, ShieldAlert, Droplets
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const RegisterBeneficiary = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(!!id);
  
  const [formData, setFormData] = useState({
    name: '', age: '', contact_number: '', 
    state: '', district: '', block: '', village: '',
    edd: '', govt_id: '', is_high_risk: false, current_phase: 'antenatal',
    medical_fields: {
      blood_group: '',
      history: ''
    }
  });

  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  useEffect(() => {
    if (id) {
      const loadData = async () => {
        try {
          setIsInitialLoading(true);
          const response = await ashaService.getBeneficiaryById(id);
          const b = response.data || response;
          if (b) {
            setFormData({
              name: b.name || '',
              age: b.age || '',
              contact_number: b.contact_number || '',
              state: b.state || '',
              district: b.district || '',
              block: b.block || '',
              village: b.village || '',
              edd: b.edd ? b.edd.split('T')[0] : '',
              govt_id: b.govt_id || '',
              is_high_risk: !!b.is_high_risk,
              current_phase: b.current_phase || 'antenatal',
              medical_fields: b.medical_fields || { blood_group: '', history: '' }
            });
          }
        } catch (error) {
          toast.error(t('errors.recordNotFound'));
          navigate('/asha/beneficiaries');
        } finally { setIsInitialLoading(false); }
      };
      loadData();
    }
  }, [id, navigate, t]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'age' && value < 0) return;
    if (name === 'contact_number') {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (onlyNums.length > 10) return;
      setFormData(prev => ({ ...prev, [name]: onlyNums }));
      return;
    }
    if (name === 'blood_group' || name === 'history') {
      setFormData(prev => ({
        ...prev,
        medical_fields: { ...prev.medical_fields, [name]: value }
      }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.contact_number.length !== 10) {
      return toast.error(t('errors.invalidPhone'));
    }

    setIsSubmitting(true);
    try {
      if (id) {
        await ashaService.updateBeneficiary(id, formData);
        toast.success(t('success.updated'));
      } else {
        await ashaService.registerBeneficiary(formData);
        toast.success(t('success.registered'));
      }
      navigate('/asha/beneficiaries');
    } catch (error) {
      toast.error(error.response?.data?.message || t('errors.submitFailed'));
    } finally { setIsSubmitting(false); }
  };

  if (isInitialLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
      <p className="text-slate-400 font-bold">{t('common.syncing')}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white px-6 py-6 sticky top-0 z-30 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl">
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900">
              {id ? t('registration.updateTitle') : t('registration.registerTitle')}
            </h1>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">
              {t('common.maternalModule')}
            </p>
          </div>
        </div>
        <Sparkles className="text-emerald-500" size={20} />
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        
        {/* Identity Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <User size={16} className="text-slate-400" />
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('forms.identity')}</h2>
          </div>
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            <input required name="name" value={formData.name} onChange={handleChange} placeholder={t('forms.full_name')} className="w-full p-5 outline-none font-black text-slate-700 placeholder:text-slate-300 border-b border-slate-50" />
            <div className="grid grid-cols-2">
              <input required type="number" name="age" min="0" value={formData.age} onChange={handleChange} placeholder={t('placeholders.age')} className="w-full p-5 outline-none font-bold text-slate-700 border-r border-slate-50" />
              <input name="govt_id" value={formData.govt_id} onChange={handleChange} placeholder={t('forms.govt_id')} className="w-full p-5 outline-none font-bold text-slate-700" />
            </div>
          </div>
        </section>

        {/* Location & Contact Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-slate-400" />
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('forms.loc_contact')}</h2>
          </div>
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="grid grid-cols-2 border-b border-slate-50">
              <input required name="state" value={formData.state} onChange={handleChange} placeholder={t('forms.state')} className="w-full p-5 outline-none font-bold text-slate-700 border-r border-slate-50" />
              <input required name="district" value={formData.district} onChange={handleChange} placeholder={t('forms.district')} className="w-full p-5 outline-none font-bold text-slate-700" />
            </div>
            <div className="grid grid-cols-2 border-b border-slate-50">
              <input required name="block" value={formData.block} onChange={handleChange} placeholder={t('forms.block')} className="w-full p-5 outline-none font-bold text-slate-700 border-r border-slate-50" />
              <input required name="village" value={formData.village} onChange={handleChange} placeholder={t('forms.village')} className="w-full p-5 outline-none font-bold text-slate-700" />
            </div>
            <div className="flex items-center px-4 gap-3 bg-white">
              <Phone size={18} className="text-slate-300" />
              <input required type="text" inputMode="numeric" name="contact_number" value={formData.contact_number} onChange={handleChange} placeholder={t('forms.contact')} className="w-full py-5 bg-transparent outline-none font-bold text-slate-700" />
            </div>
          </div>
        </section>

        {/* Medical History Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-slate-400" />
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('forms.med_bg')}</h2>
          </div>
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block flex items-center gap-2">
                <Droplets size={12} className="text-rose-500" /> {t('forms.blood_group')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {bloodGroups.map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => handleChange({ target: { name: 'blood_group', value: bg } })}
                    className={`py-3 rounded-xl text-xs font-black transition-all ${
                      formData.medical_fields.blood_group === bg 
                      ? 'bg-rose-600 text-white shadow-md' 
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block flex items-center gap-2">
                <ShieldAlert size={12} className="text-amber-500" /> {t('forms.med_history')}
              </label>
              <textarea 
                name="history"
                value={formData.medical_fields.history}
                onChange={handleChange}
                placeholder={t('placeholders.medicalHistory')}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-medium text-slate-700 text-sm min-h-[100px] resize-none focus:bg-white focus:border-emerald-200 transition-all"
              />
            </div>
          </div>
        </section>

        {/* Clinical Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-slate-400" />
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('forms.clinical_priority')}</h2>
          </div>
          <div className={`p-6 rounded-[2.5rem] border-2 transition-colors ${formData.is_high_risk ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
            <label className="text-[10px] font-black uppercase tracking-tighter text-slate-400 block mb-2 ml-1">{t('forms.edd')}</label>
            <div className="bg-white p-4 rounded-2xl shadow-inner mb-6 flex items-center">
               <Calendar className="text-slate-300 mr-3" size={20} />
               <input required type="date" name="edd" value={formData.edd} onChange={handleChange} className="w-full outline-none font-black text-slate-700" />
            </div>

            <label className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${formData.is_high_risk ? 'bg-rose-600 text-white shadow-lg' : 'bg-white text-slate-700 border border-emerald-200'}`}>
              <div className="flex items-center gap-3 text-sm font-black">
                <AlertCircle size={20} />
                {formData.is_high_risk ? t('forms.high_risk_alert') : t('forms.mark_priority')}
              </div>
              <input type="checkbox" name="is_high_risk" checked={formData.is_high_risk} onChange={handleChange} className="w-6 h-6 accent-white" />
            </label>
          </div>
        </section>

        <div className="pt-4 pb-12">
          <button 
            disabled={isSubmitting} 
            type="submit" 
            className={`w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] font-black text-white transition-all active:scale-[0.98] disabled:bg-slate-300 ${id ? 'bg-slate-900 shadow-xl' : 'bg-emerald-600 shadow-xl'}`}
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : (
              <>
                <Save size={20} />
                <span className="uppercase tracking-widest text-sm">
                    {id ? t('forms.save') : t('buttons.confirm')}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterBeneficiary;