/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/adminService';
import toast from 'react-hot-toast';
import { 
  Search, X, FileText, Save, Edit2, List, AlertTriangle, 
  UserCheck, MapPin, Users, ClipboardCheck, CheckSquare, Square ,Loader2
} from 'lucide-react';

const BeneficiaryDirectory = () => {
  const [data, setData] = useState([]);
  const [ashas, setAshas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedVillage, setSelectedVillage] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Feature A: Bulk Actions State
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAshaId, setBulkAshaId] = useState("");

  useEffect(() => {
    fetchData();
    fetchAshas();
  }, []);

  const fetchData = async () => {
    try {
      const res = await adminService.getBeneficiaries();
      const records = res.data?.data || res.data || res || [];
      setData(records);
    } catch (err) {
      toast.error("Failed to sync directory");
      setData([]);
    }
  };

  const fetchAshas = async () => {
    try {
      const res = await adminService.getAshaWorkers();
      const workers = res.data || res || [];
      setAshas(Array.isArray(workers) ? workers : []);
    } catch (err) {
      console.error("Failed to load ASHAs");
    }
  };

  // Feature B: Alert Logic (EDD within 7 days & Unassigned)
  const getAlertStatus = (edd, ashaId) => {
    if (!edd || ashaId) return "";
    const today = new Date();
    const eddDate = new Date(edd);
    const diffDays = Math.ceil((eddDate - today) / (1000 * 60 * 60 * 24));
    if (diffDays <= 7 && diffDays >= 0) return "bg-rose-50 border-rose-200 animate-pulse-slow";
    return "";
  };

const handleEditClick = (user) => {
  setSelectedUser(user);
  setEditData({
    name: user.name || '',
    village: user.village || '',
    edd: user.edd ? new Date(user.edd).toISOString().split('T')[0] : '',
    contact_number: user.contact_number || '',
    assigned_asha_id: user.assigned_asha_id || '',
    govt_id: user.govt_id || '', // Added
    age: user.age || '',          // Added if applicable
    health_status: user.health_status || 'normal' // Added if applicable
  });
}; 

  const handleUpdate = async (e) => {
  e.preventDefault();
  setLoading(true);
  const loadId = toast.loading("Updating record...");
  
  try {
    // 1. Clean the payload to match your 'forms' or 'beneficiaries' table schema
    const payload = {
      name: editData.name,
      village: editData.village || null,
      contact_number: editData.contact_number || null,
      assigned_asha_id: editData.assigned_asha_id || null,
      edd: editData.edd || null,
      govt_id: editData.govt_id || null
      // Do NOT send 'age' or 'health_status' yet if they aren't in your DB columns
    };


    await adminService.updateBeneficiary(selectedUser.id, payload);
    
    await fetchData(); // Refresh the list
    toast.success("Record updated", { id: loadId });
    setSelectedUser(null); // Close modal
  } catch (err) {
    console.error("Update Error Details:", err.response?.data || err.message);
    toast.error(err.response?.data?.message || "Update failed", { id: loadId });
  } finally {
    setLoading(false);
  }
};

  const handleBulkAssign = async () => {
    if (!bulkAshaId) return toast.error("Please select an ASHA");
    const loadId = toast.loading(`Assigning ${selectedIds.length} records...`);
    try {
      await Promise.all(selectedIds.map(id => 
        adminService.updateBeneficiary(id, { assigned_asha_id: bulkAshaId })
      ));
      await fetchData();
      setSelectedIds([]);
      setBulkAshaId("");
      toast.success("Bulk assignment successful", { id: loadId });
    } catch (err) {
      toast.error("Bulk update failed", { id: loadId });
    }
  };

  const uniqueVillages = [...new Set(data.map(item => item.village))].filter(Boolean).sort();

  const filteredData = data.filter(b => {
    const matchesSearch = b.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.govt_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filter === "all" ? true : !b.is_data_complete;
    const matchesVillage = selectedVillage === "all" ? true : b.village === selectedVillage;
    return matchesSearch && matchesStatus && matchesVillage;
  });

  const stats = {
    total: filteredData.length,
    unassigned: filteredData.filter(b => !b.assigned_asha_id).length,
    incomplete: filteredData.filter(b => !b.is_data_complete).length
  };

  // Feature C: Village Priority Logic
  const villageNeeds = uniqueVillages.map(v => ({
    name: v,
    unassigned: data.filter(b => b.village === v && !b.assigned_asha_id).length
  })).sort((a, b) => b.unassigned - a.unassigned).slice(0, 4);

  const handleExport = async () => {
    const loadId = toast.loading("Generating CSV Report...");
    try {
      const response = await adminService.exportCSV(selectedVillage);
      const blobData = response.data || response;
      const blob = blobData instanceof Blob ? blobData : new Blob([blobData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `NitiCare_Report_${selectedVillage}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Download complete", { id: loadId });
    } catch (err) {
      toast.error("Export failed", { id: loadId });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-24">
      
      {/* 1. Summary Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-emerald-200" onClick={() => setFilter('all')}>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Users size={20}/></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Total Tracked</p>
            <p className="text-xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><UserCheck size={20}/></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Unassigned</p>
            <p className="text-xl font-bold text-gray-900">{stats.unassigned}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-rose-200" onClick={() => setFilter('incomplete')}>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><ClipboardCheck size={20}/></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Incomplete Data</p>
            <p className="text-xl font-bold text-gray-900">{stats.incomplete}</p>
          </div>
        </div>
      </div>

      {/* Feature C: Village Needs Visualization */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
          <AlertTriangle size={14} className="text-rose-500" /> High Priority Villages (Unassigned Cases)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {villageNeeds.map(v => (
            <div key={v.name} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-gray-600 truncate max-w-[100px]">{v.name}</span>
                <span className="text-xs font-black text-rose-600">{v.unassigned}</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((v.unassigned / (stats.total || 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Header & Filters */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Directory</h1>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 border rounded-xl px-3 py-2">
              <MapPin size={14} className="text-emerald-500" />
              <select 
                className="bg-transparent text-sm font-semibold outline-none pr-2"
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
              >
                <option value="all">All Villages</option>
                {uniqueVillages.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div className="flex bg-gray-100 p-1 rounded-xl border">
              <button onClick={() => setFilter("all")} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500'}`}>
                <List size={14} /> ALL
              </button>
              <button onClick={() => setFilter("incomplete")} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'incomplete' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500'}`}>
                <AlertTriangle size={14} /> INCOMPLETE
              </button>
            </div>

            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white border border-emerald-200 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-50 shadow-sm">
              <FileText size={16} /> Export CSV
            </button>
          </div>
        </div>

        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or Government ID..." 
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 3. Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b text-gray-500 font-bold uppercase text-[10px] tracking-widest">
            <tr>
              <th className="px-6 py-4 w-10">
                <button 
                  onClick={() => setSelectedIds(selectedIds.length === filteredData.length ? [] : filteredData.map(i => i.id))}
                  className="text-gray-400 hover:text-emerald-600"
                >
                  {selectedIds.length === filteredData.length && filteredData.length > 0 ? <CheckSquare size={18}/> : <Square size={18}/>}
                </button>
              </th>
              <th className="px-6 py-4">Beneficiary</th>
              <th className="px-6 py-4">Village</th>
              <th className="px-6 py-4">Allocation</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredData.length > 0 ? filteredData.map((b) => (
              <tr key={b.id} className={`hover:bg-emerald-50/30 transition-colors ${getAlertStatus(b.edd, b.assigned_asha_id)}`}>
                <td className="px-6 py-4">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(b.id)}
                    onChange={() => setSelectedIds(prev => prev.includes(b.id) ? prev.filter(id => id !== b.id) : [...prev, b.id])}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{b.name}</div>
                  <div className="text-[10px] text-gray-400 font-mono flex items-center gap-2">
                    {b.govt_id || 'NO GOVT ID'} 
                    {!b.assigned_asha_id && b.edd && <span className="text-rose-500 font-bold underline">Due: {new Date(b.edd).toLocaleDateString()}</span>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1 text-gray-600">
                    <MapPin size={12} className="text-gray-300"/> {b.village || '---'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className={`flex items-center gap-2 font-bold ${b.asha_name ? 'text-emerald-700' : 'text-gray-300'}`}>
                    <UserCheck size={14} />
                    {b.asha_name || <span className="font-normal italic text-xs uppercase tracking-tighter">Needs ASHA</span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEditClick(b)} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all">
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="px-6 py-20 text-center text-gray-400 italic">No records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Feature A: Bulk Action Floating Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-10">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Selected</span>
            <span className="text-lg font-black text-emerald-400 leading-none">{selectedIds.length}</span>
          </div>
          <div className="h-8 w-[1px] bg-gray-700" />
          <select 
            className="bg-gray-800 border border-gray-700 rounded-xl text-sm px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
            value={bulkAshaId}
            onChange={(e) => setBulkAshaId(e.target.value)}
          >
            <option value="">Assign to ASHA...</option>
            {ashas.map(a => <option key={a.id} value={a.id}>{a.full_name} ({a.village})</option>)}
          </select>
          <button 
            onClick={handleBulkAssign}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 active:scale-95"
          >
            Update All
          </button>
          <button onClick={() => setSelectedIds([])} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 transition-colors">
            <X size={20}/>
          </button>
        </div>
      )}

      {/* 4. Edit Modal */}
      {selectedUser && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <form onSubmit={handleUpdate} className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
      {/* Modal Header */}
      <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
        <div>
          <h3 className="text-lg font-black text-gray-900">Beneficiary Profile</h3>
          <p className="text-[10px] text-gray-400 font-mono">ID: {selectedUser.id}</p>
        </div>
        <button type="button" onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
      </div>

      <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Section: Personal Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 md:col-span-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
            <input className="w-full mt-1 p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-semibold" 
              value={editData.name} 
              onChange={e => setEditData({...editData, name: e.target.value})} required 
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Government ID (Aadhaar/ABHA)</label>
            <input className="w-full mt-1 p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono" 
              value={editData.govt_id} 
              onChange={e => setEditData({...editData, govt_id: e.target.value})} 
            />
          </div>
        </div>

        {/* Section: Allocation & Location */}
        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1">
              <UserCheck size={12}/> Assigned ASHA Worker
            </label>
            <select className="w-full mt-1 p-3 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-emerald-900" 
              value={editData.assigned_asha_id} 
              onChange={e => setEditData({...editData, assigned_asha_id: e.target.value})}
            >
              <option value="">-- No ASHA (Unassigned) --</option>
              {ashas.map(a => <option key={a.id} value={a.id}>{a.full_name} — {a.village}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Village Name</label>
            <input className="w-full mt-1 p-3 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" 
              value={editData.village} 
              onChange={e => setEditData({...editData, village: e.target.value})} 
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Contact Number</label>
            <input className="w-full mt-1 p-3 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" 
              value={editData.contact_number} 
              onChange={e => setEditData({...editData, contact_number: e.target.value})} 
            />
          </div>
        </div>

        {/* Section: Health Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expected Delivery Date (EDD)</label>
            <input type="date" className="w-full mt-1 p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" 
              value={editData.edd} 
              onChange={e => setEditData({...editData, edd: e.target.value})} 
            />
          </div>
          {/* Add more fields here as needed */}
        </div>
      </div>

      {/* Modal Actions */}
      <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
        <button type="button" onClick={() => setSelectedUser(null)} className="px-6 py-2 text-gray-500 font-bold hover:text-gray-700 transition-colors">Cancel</button>
        <button type="submit" disabled={loading} className="px-8 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 flex items-center gap-2 transition-all active:scale-95">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  </div>
)}
    </div>
  );
};

export default BeneficiaryDirectory;