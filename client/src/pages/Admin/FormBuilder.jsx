/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/adminService';
import toast from 'react-hot-toast';
import { 
  Plus, Trash2, Save, Eye, Settings2, GripVertical, 
  ChevronDown, Globe, Layout, CheckCircle2, AlertCircle, Search, ToggleRight, ToggleLeft 
} from 'lucide-react';

const FormBuilder = () => {
  // --- STATES ---
  const [title, setTitle] = useState("");
  const [phase, setPhase] = useState("antenatal");
  const [fields, setFields] = useState([
    { id: Date.now(), name: 'full_name', label: 'Patient Full Name', type: 'text', required: true }
  ]);
  const [existingForms, setExistingForms] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // --- EFFECTS ---
  useEffect(() => {
    loadExistingForms();
  }, []);

  const loadExistingForms = async () => {
  try {
    const res = await adminService.getFormsByPhase("all");
    
    // Log this to your browser console (F12) to see the structure!
    console.log("Server Response:", res);

    if (res && res.data) {
      // If the backend sent { status: 'success', data: [...] }
      setExistingForms(res.data);
    } else if (Array.isArray(res)) {
      // If the backend sent the array directly
      setExistingForms(res);
    } else {
      setExistingForms([]);
    }
  } catch (err) {
    console.error("Fetch Error:", err);
    setExistingForms([]);
  }
};

  // --- FIELD HANDLERS ---
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
        schema: processedSchema
      });

      toast.success("Form Published Successfully!", { id: loadId });
      setTitle("");
      setFields([{ id: Date.now(), name: 'full_name', label: 'Patient Full Name', type: 'text', required: true }]);
      
      // Re-fetch to update the directory below
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
    if (!window.confirm("Delete this form? This cannot be undone.")) return;
    try {
      await adminService.deleteForm(id);
      toast.success("Form deleted");
      loadExistingForms();
    } catch (err) {
      toast.error("Cannot delete form with active responses");
    }
  };

  // Filter for the directory table
  const filteredForms = Array.isArray(existingForms) 
    ? existingForms.filter(f => f.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-16 pb-20">
      
      {/* SECTION 1: BUILDER & PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: Editor Side */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Settings2 size={24}/></div>
              <div>
                <h1 className="text-2xl font-black text-gray-800 tracking-tight">Form Engine</h1>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Build dynamic medical checkups</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Form Identity</label>
                <input 
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-bold" 
                  placeholder="e.g., Routine Antenatal Checkup"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Phase Category</label>
                <select 
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                  value={phase}
                  onChange={(e) => setPhase(e.target.value)}
                >
                  <option value="antenatal">Pregnancy (Antenatal)</option>
                  <option value="postnatal">Post-Delivery (Postnatal)</option>
                  <option value="child_care">Newborn (Child Care)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Questions Schema</h3>
            {fields.map((field) => (
              <div key={field.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4 group hover:border-emerald-200 transition-all">
                <div className="mt-3 text-gray-200 group-hover:text-emerald-300"><GripVertical size={20}/></div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-6">
                    <input 
                      placeholder="Question Label (e.g. Weight in kg)"
                      className="w-full p-2 bg-transparent border-b-2 border-gray-50 focus:border-emerald-500 outline-none font-bold text-gray-700"
                      value={field.label}
                      onChange={(e) => updateField(field.id, 'label', e.target.value)}
                    />
                  </div>
                  
                  <div className="md:col-span-3">
                    <select 
                      className="w-full p-2 bg-gray-50 rounded-xl text-xs font-black text-gray-600 outline-none"
                      value={field.type}
                      onChange={(e) => updateField(field.id, 'type', e.target.value)}
                    >
                      <option value="text">ABC Text</option>
                      <option value="number">123 Numeric</option>
                      <option value="select">Selection List</option>
                      <option value="date">Date Picker</option>
                    </select>
                  </div>

                  <div className="md:col-span-3 flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={field.required}
                        onChange={(e) => updateField(field.id, 'required', e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-500" 
                      />
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Required</span>
                    </label>
                    <button onClick={() => removeField(field.id)} className="p-2 text-gray-300 hover:text-rose-500">
                      <Trash2 size={16}/>
                    </button>
                  </div>

                  {field.type === 'select' && (
                    <div className="col-span-full">
                      <input 
                        placeholder="Options: Normal, High, Critical (comma separated)"
                        className="w-full p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-xs"
                        value={field.options}
                        onChange={(e) => updateField(field.id, 'options', e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={addField}
            className="w-full py-5 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-black text-xs uppercase hover:bg-emerald-50 hover:text-emerald-500 transition-all flex items-center justify-center gap-3"
          >
            <Plus size={18}/> Add Medical Question
          </button>
        </div>

        {/* RIGHT: Live Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            <div className="bg-gray-900 rounded-[3rem] p-4 shadow-2xl border-[12px] border-gray-800">
              <div className="bg-white rounded-[2.2rem] h-[500px] overflow-hidden flex flex-col">
                <div className="bg-emerald-600 p-6 pt-10 text-white relative">
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-emerald-700 rounded-full"></div>
                  <h2 className="text-lg font-bold leading-tight">{title || "Preview"}</h2>
                  <p className="text-[10px] font-bold opacity-70 uppercase mt-1">{phase}</p>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto flex-1">
                  {fields.map((f) => (
                    <div key={f.id} className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500">{f.label || "Label"}</label>
                      <div className="w-full p-3 bg-gray-50 border rounded-xl text-xs text-gray-300">Enter Response...</div>
                    </div>
                  ))}
                </div>
                <div className="p-6 bg-gray-50 border-t">
                    <button disabled className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold opacity-40 text-xs uppercase tracking-widest">Submit</button>
                </div>
              </div>
            </div>

            <button 
              onClick={handlePublish}
              disabled={isSaving}
              className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
            >
              <Save size={20}/> {isSaving ? 'Publishing...' : 'Publish Form'}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: DIRECTORY */}
      <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-gray-800 tracking-tight">Form Inventory</h2>
            <p className="text-xs text-gray-400 font-bold uppercase">Manage published templates</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
            <input 
              type="text"
              placeholder="Search forms..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] border-b">
              <tr>
                <th className="px-8 py-5">Form Details</th>
                <th className="px-8 py-5">Phase</th>
                <th className="px-8 py-5 text-center">Questions</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredForms.map((form) => (
                <tr key={form.id} className="hover:bg-gray-50/80 transition-all group">
                  <td className="px-8 py-6">
                    <div className="font-black text-gray-800 group-hover:text-emerald-600">{form.title}</div>
                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">{form.id.toString().slice(0, 8)}</div>
                  </td>
                  <td className="px-8 py-6 text-xs font-bold text-blue-600 uppercase">
                    {form.phase}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-[10px] font-black">
                      {typeof form.schema === 'string' ? JSON.parse(form.schema).length : form.schema.length}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <button onClick={() => handleToggleStatus(form.id)}>
                      {form.is_active ? 
                        <ToggleRight className="text-emerald-500" size={36}/> : 
                        <ToggleLeft className="text-gray-300" size={36}/>
                      }
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => handleDelete(form.id)} className="p-3 text-gray-300 hover:text-rose-500 transition-all">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredForms.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-gray-300 font-bold uppercase tracking-widest">
                    No forms available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;