/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { formService } from '../../api/formService.js';
import { recordService } from '../../api/recordService';
import { ChevronLeft, Save, Loader2, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const FillForm = () => {
  const { formId, beneficiaryId } = useParams();
  const [searchParams] = useSearchParams();
  const month = searchParams.get('month');
  const navigate = useNavigate();

  const [formConfig, setFormConfig] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCarriedForward, setIsCarriedForward] = useState(false);

  useEffect(() => {
    loadFormAndData();
  }, [formId, beneficiaryId, month]);

  const loadFormAndData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Form Structure (Schema)
      const response = await formService.getFormById(formId);
      let fetchedConfig = response.data || response;
      
      if (fetchedConfig && typeof fetchedConfig.schema === 'string') {
        try {
          fetchedConfig.schema = JSON.parse(fetchedConfig.schema);
        } catch (e) {
          console.error("JSON Parse Error on schema:", e);
        }
      }
      setFormConfig(fetchedConfig);

      // 2. Fetch Existing or Previous Record
      try {
        const existingRes = await recordService.getExistingRecord(beneficiaryId, formId, month);
        
        // existingRes is the unwrapped record object from our service
        if (existingRes && existingRes.data) {
          const record = existingRes;
          
          // Check if this is data from a previous month (Carry Forward)
          setIsCarriedForward(!!record.is_carried_forward);

          let finalAnswers = record.data;
          
          // Ensure data is an object
          if (typeof finalAnswers === 'string') {
            finalAnswers = JSON.parse(finalAnswers);
          }

          setFormData(finalAnswers || {});
          console.log(record.is_carried_forward ? "⏩ Data Carried Forward" : "✅ Existing Data Found", finalAnswers);
        } else {
          console.log("ℹ️ No record found, starting with clean form.");
          setFormData({});
          setIsCarriedForward(false);
        }
      } catch (e) {
        console.log("No existing record found.");
      }
    } catch (err) {
      console.error("Load Error:", err);
      toast.error("Failed to load form fields");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        beneficiary_id: parseInt(beneficiaryId),
        form_id: formId,
        month_number: parseInt(month),
        data: formData 
      };

      await recordService.saveANCRecord(payload);
      toast.success("Assessment Saved Successfully");
      navigate(-1);
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save record");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white">
      <Loader2 className="animate-spin text-emerald-600" size={40} />
      <p className="font-bold text-slate-400 animate-pulse uppercase tracking-widest text-xs">Loading Assessment...</p>
    </div>
  );

  const fields = formConfig?.schema?.fields || (Array.isArray(formConfig?.schema) ? formConfig.schema : []);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
     {/* Header */}
<div className="bg-white p-6 border-b sticky top-0 z-10 flex items-center justify-between">
  <div className="flex items-center gap-4">
    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
      <ChevronLeft size={24} />
    </button>
    <div>
      <h1 className="text-xl font-black text-slate-800">{formConfig?.title || 'Form'}</h1>
      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
        {/* Dynamic Month/Registration Label */}
        {month === '0' ? '' : `Month ${month}`} 
        {" • "}
        {/* Dynamic Phase Label (ANC, Postnatal, Child, etc.) */}
        {formConfig?.phase ? `${formConfig.phase.toUpperCase()} Assessment` : 'Assessment'}
      </p>
    </div>
  </div>
</div>

      <form onSubmit={handleSubmit} className="p-6 max-w-2xl mx-auto space-y-6">
        
        {/* Carry Forward Alert */}
        {isCarriedForward && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-3xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="bg-amber-100 p-2 rounded-2xl text-amber-600">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs font-black text-amber-800 uppercase tracking-tight">Previous Data Loaded</p>
              <p className="text-[10px] font-bold text-amber-600 uppercase">Please verify and update for Month {month}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-6">
          {fields.length > 0 ? (
            fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">
                  {field.label} {field.required && <span className="text-rose-500">*</span>}
                </label>
                
                {field.type === 'select' ? (
                  <select
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                  >
                    <option value="">Select Option</option>
                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input
                    type={field.type || 'text'}
                    step={field.type === 'number' ? "any" : undefined}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold placeholder:text-slate-300"
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                  />
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10 flex flex-col items-center gap-2">
              <AlertCircle className="text-slate-300" size={40} />
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No fields configured for this form.</p>
            </div>
          )}
        </div>

        {fields.length > 0 && (
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-emerald-600 text-white p-5 rounded-[1.5rem] font-black shadow-lg shadow-emerald-100 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            {saving ? "SAVING ASSESSMENT..." : "SAVE ASSESSMENT"}
          </button>
        )}
      </form>
    </div>
  );
};

export default FillForm;