/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/adminService';
import toast from 'react-hot-toast';
import { 
  Plus, Trash2, Save, Eye, Settings2, GripVertical, 
  Calendar, RotateCcw, CheckCircle2, AlertCircle, Search, 
  ToggleRight, ToggleLeft, Layers
} from 'lucide-react';

const FormBuilder = () => {
  // --- STATES ---
  const [title, setTitle] = useState("");
  const [phase, setPhase] = useState("antenatal");
  const [monthNumber, setMonthNumber] = useState(1); // New State for Month
  const [isRecurring, setIsRecurring] = useState(false); // New State for Recurring
  const [fields, setFields] = useState([
    { id: Date.now(), name: 'full_name', label: 'Patient Full Name', type: 'text', required: true }
  ]);
  const [existingForms, setExistingForms] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadExistingForms();
  }, []);

  const loadExistingForms = async () => {
    try {
      const res = await adminService.getFormsByPhase("all");
      if (res && res.data) {
        setExistingForms(res.data);
      } else if (Array.isArray(res)) {
        setExistingForms(res);
      } else {
        setExistingForms([]);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setExistingForms([]);
    }
  };

  const addField = () => {
    setFields([...fields, { 
      id: Date.now(), 
      name: '', 
      label: '', 
      type: 'text', 
      required: false,
      options: "" 
    }]);
  };

  const updateField = (id, key, value) => {
    setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const removeField = (id) => {
    if (fields.length === 1) return toast.error("Form must have at least one field");
    setFields(fields.filter(f => f.id !== id));
  };

  // --- FORM ACTIONS ---
  const handlePublish = async () => {
    if (!title) return toast.error("Please enter a form title");
    setIsSaving(true);
    const loadId = toast.loading("Publishing form schema...");
    
    try {
      const processedSchema = fields.map(f => ({
        ...f,
        name: f.label.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, ''),
        options: f.type === 'select' ? f.options.split(',').map(o => o.trim()).filter(Boolean) : []
      }));

      await adminService.createDynamicForm({
        title,
        phase,
        month_number: phase === 'antenatal' ? monthNumber : null,
        is_recurring: isRecurring,
        schema: processedSchema
      });

      toast.success("Form Published Successfully!", { id: loadId });
      setTitle("");
      setFields([{ id: Date.now(), name: 'full_name', label: 'Patient Full Name', type: 'text', required: true }]);
      setMonthNumber(1);
      setIsRecurring(false);
      loadExistingForms();
    } catch (err) {
      toast.error(err.message || "Failed to publish", { id: loadId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await adminService.toggleFormStatus(id);
      toast.success("Status updated");
      loadExistingForms();
    } catch (err) {
      toast.error("Toggle failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this form?")) return;
    try {
      await adminService.deleteForm(id);
      toast.success("Form deleted");
      loadExistingForms();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const filteredForms = Array.isArray(existingForms) 
    ? existingForms.filter(f => f.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-12 pb-20">
      
      {/* SECTION 1: BUILDER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-100"><Settings2 size={24}/></div>
              <div>
                <h1 className="text-2xl font-black text-slate-800">Form Engine</h1>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Assign forms to pregnancy months</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Title</label>
                <input 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700" 
                  placeholder="e.g., 3rd Month Blood Test"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Medical Phase</label>
                <select 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 appearance-none"
                  value={phase}
                  onChange={(e) => setPhase(e.target.value)}
                >
                  <option value="antenatal">Pregnancy (Antenatal)</option>
                  <option value="postnatal">Post-Delivery (Postnatal)</option>
                  <option value="child_care">Newborn (Child Care)</option>
                </select>
              </div>

              {/* DYNAMIC MONTH FIELD */}
              {phase === 'antenatal' && (
                <div className="space-y-1 md:col-span-1 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-bold text-emerald-600 uppercase ml-1 tracking-widest flex items-center gap-2">
                    <Calendar size={12}/> Target Pregnancy Month
                  </label>
                  <select 
                    disabled={isRecurring}
                    className="w-full p-4 bg-emerald-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-black text-emerald-700 disabled:opacity-30"
                    value={monthNumber}
                    onChange={(e) => setMonthNumber(parseInt(e.target.value))}
                  >
                    {[1,2,3,4,5,6,7,8,9].map(m => (
                      <option key={m} value={m}>Month {m}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* RECURRING TOGGLE */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl md:col-span-1">
                <div className="flex items-center gap-3 text-slate-600">
                  <RotateCcw size={20} className={isRecurring ? "text-blue-500 animate-spin-slow" : "text-slate-400"}/>
                  <span className="text-xs font-black uppercase">Recurring Form?</span>
                </div>
                <button 
                  onClick={() => setIsRecurring(!isRecurring)}
                  className="focus:outline-none"
                >
                  {isRecurring ? <ToggleRight size={32} className="text-blue-500"/> : <ToggleLeft size={32} className="text-slate-300"/>}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-start gap-4 group hover:border-emerald-200 transition-all">
                <div className="mt-3 text-slate-200 group-hover:text-emerald-300"><GripVertical size={20}/></div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-6">
                    <input 
                      placeholder="Input Label"
                      className="w-full p-2 bg-transparent border-b-2 border-slate-50 focus:border-emerald-500 outline-none font-bold text-slate-700"
                      value={field.label}
                      onChange={(e) => updateField(field.id, 'label', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <select className="w-full p-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-500 outline-none uppercase" value={field.type} onChange={(e) => updateField(field.id, 'type', e.target.value)}>
                      <option value="text">Text Input</option>
                      <option value="number">Numeric</option>
                      <option value="select">Selection List</option>
                      <option value="date">Date</option>
                      <option value="time">Time</option>

                    </select>
                  </div>
                  <div className="md:col-span-3 flex items-center justify-end gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={field.required} onChange={(e) => updateField(field.id, 'required', e.target.checked)} className="w-4 h-4 rounded accent-emerald-600" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Req</span>
                    </label>
                    <button onClick={() => removeField(field.id)} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button>
                  </div>
                  {field.type === 'select' && (
                    <div className="col-span-full animate-in zoom-in-95">
                      <input placeholder="Normal, High, Critical (comma separated)" className="w-full p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-[11px] font-bold text-blue-700 outline-none" value={field.options} onChange={(e) => updateField(field.id, 'options', e.target.value)} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button onClick={addField} className="w-full py-5 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-black text-xs uppercase hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 transition-all flex items-center justify-center gap-3">
            <Plus size={18}/> New Field
          </button>
        </div>

        {/* PREVIEW COLUMN */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            <div className="bg-slate-900 rounded-[3rem] p-4 shadow-2xl border-[10px] border-slate-800">
              <div className="bg-white rounded-[2.2rem] h-[480px] overflow-hidden flex flex-col">
                <div className={`p-6 pt-10 text-white relative transition-colors ${isRecurring ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                  <h2 className="text-lg font-black leading-tight truncate">{title || "Form Preview"}</h2>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[9px] font-black bg-white/20 px-2 py-0.5 rounded uppercase">{phase}</span>
                    {phase === 'antenatal' && !isRecurring && <span className="text-[9px] font-black bg-white/20 px-2 py-0.5 rounded uppercase">Month {monthNumber}</span>}
                    {isRecurring && <span className="text-[9px] font-black bg-white/20 px-2 py-0.5 rounded uppercase flex items-center gap-1"><RotateCcw size={8}/> Recurring</span>}
                  </div>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                  {fields.map((f) => (
                    <div key={f.id} className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{f.label || "Question"}</label>
                      <div className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-300 italic">Response area...</div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-slate-50 border-t flex justify-center">
                    <button disabled className="w-2/3 py-3 bg-slate-900 text-white rounded-full font-black text-[10px] uppercase tracking-widest opacity-20">Submit Form</button>
                </div>
              </div>
            </div>

            <button 
              onClick={handlePublish}
              disabled={isSaving}
              className={`w-full py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 text-white ${isSaving ? 'bg-slate-300' : 'bg-slate-900 shadow-slate-200 active:scale-95 hover:bg-black'}`}
            >
              <Save size={20}/> {isSaving ? 'Saving...' : 'Publish Schema'}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Layers size={22}/></div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Form Inventory</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Active Schema Directory</p>
            </div>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
            <input 
              type="text"
              placeholder="Filter by title..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5">Template Details</th>
                <th className="px-8 py-5">Phase / Month</th>
                <th className="px-8 py-5">Recurring</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredForms.map((form) => (
                <tr key={form.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-6">
                    <div className="font-black text-slate-700 group-hover:text-emerald-600 transition-colors">{form.title}</div>
                    <div className="text-[10px] text-slate-300 font-mono mt-0.5 uppercase tracking-tighter">ID: {form.id.toString().slice(0, 8)}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                      {form.phase} {form.month_number && `• Month ${form.month_number}`}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {form.is_recurring ? 
                      <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600"><RotateCcw size={14}/> YES</span> : 
                      <span className="text-xs font-black text-slate-300">NO</span>
                    }
                  </td>
                  <td className="px-8 py-6">
                    <button onClick={() => handleToggleStatus(form.id)}>
                      {form.is_active ? 
                        <ToggleRight className="text-emerald-500" size={32}/> : 
                        <ToggleLeft className="text-slate-200" size={32}/>
                      }
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => handleDelete(form.id)} className="p-3 text-slate-200 hover:text-rose-500 transition-all">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;