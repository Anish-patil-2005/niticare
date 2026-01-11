

/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { adminService } from "../../api/adminService";
import { ashaService } from "../../api/ashaService";
import toast from "react-hot-toast";
import {
  Search, X, FileText, Save, Edit2, List, AlertTriangle, UserCheck,
  MapPin, Users, ClipboardCheck, CheckSquare, Square, Trash2, 
  AlertCircle, Check, ShieldAlert, UserPlus, Loader2
} from "lucide-react";

const BeneficiaryDirectory = ({ mode = "admin" }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [ashas, setAshas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); 
  const [selectedVillage, setSelectedVillage] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAshaId, setBulkAshaId] = useState("");

  const isAshaMode = mode === "asha";

  useEffect(() => {
    fetchData();
    if (!isAshaMode) fetchAshas();
  }, [mode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = isAshaMode
        ? await ashaService.getAssignedBeneficiaries()
        : await adminService.getBeneficiaries();
      const records = res.data?.data || res.data || res || [];
      setData(records);
    } catch (err) {
      toast.error(t('common.loading_error') || "Failed to sync directory");
      setData([]);
    } finally {
      setLoading(false);
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

  const getAlertStatus = (edd, ashaId, isHighRisk) => {
    if (isHighRisk) return "bg-red-50 border-l-4 border-l-red-500 hover:bg-red-100";
    if (isAshaMode || !edd || ashaId) return "";
    const today = new Date();
    const eddDate = new Date(edd);
    const diffDays = Math.ceil((eddDate - today) / (1000 * 60 * 60 * 24));
    if (diffDays <= 7 && diffDays >= 0) return "bg-rose-50 border-rose-200 animate-pulse-slow";
    return "";
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditData({
      name: user.name || "",
      state: user.state || "",
      district: user.district || "",
      block: user.block || "",
      village: user.village || "",
      edd: user.edd ? new Date(user.edd).toISOString().split("T")[0] : "",
      contact_number: user.contact_number || "",
      assigned_asha_id: user.assigned_asha_id || "",
      govt_id: user.govt_id || "",
      age: user.age || "",
      is_high_risk: !!user.is_high_risk,
    });
  };

  const handleDeleteManual = async (id) => {
    if (!window.confirm(t('common.confirm_delete') || "Are you sure?")) return;
    try {
      const loadId = toast.loading(t('common.loading'));
      await ashaService.deleteManualBeneficiary(id);
      toast.success(t('common.success'), { id: loadId });
      fetchData();
    } catch (err) {
      toast.error(t('common.error'));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const isComplete = !!(editData.name && editData.edd && editData.village && editData.state && editData.district);
    const loadId = toast.loading(t('common.loading'));
    try {
      const payload = {
        name: editData.name,
        state: editData.state || null,
        district: editData.district || null,
        block: editData.block || null,
        village: editData.village || null,
        contact_number: editData.contact_number || null,
        edd: editData.edd || null,
        govt_id: editData.govt_id || null,
        is_high_risk: editData.is_high_risk,
        is_data_complete: isComplete,
      };
      if (mode === "admin") payload.assigned_asha_id = editData.assigned_asha_id || null;
      isAshaMode ? await ashaService.updateBeneficiary(selectedUser.id, payload) : await adminService.updateBeneficiary(selectedUser.id, payload);
      await fetchData();
      toast.success(t('common.save'), { id: loadId });
      setSelectedUser(null);
    } catch (err) {
      toast.error(t('common.error'), { id: loadId });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAssign = async () => {
    if (!bulkAshaId) return toast.error(t('tasks.select_asha'));
    const loadId = toast.loading(t('common.loading'));
    try {
      await Promise.all(selectedIds.map((id) => adminService.updateBeneficiary(id, { assigned_asha_id: bulkAshaId })));
      await fetchData();
      setSelectedIds([]);
      setBulkAshaId("");
      toast.success(t('common.success'), { id: loadId });
    } catch (err) {
      toast.error(t('common.error'), { id: loadId });
    }
  };

  const handleExport = async () => {
    const loadId = toast.loading(t('common.loading'));
    try {
      const response = await adminService.exportCSV(selectedVillage);
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Report_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(t('common.success'), { id: loadId });
    } catch (err) {
      toast.error(t('common.error'), { id: loadId });
    }
  };

  const uniqueVillages = [...new Set(data.map((item) => item.village))].filter(Boolean).sort();

  const filteredData = data.filter((b) => {
    const matchesSearch = b.name?.toLowerCase().includes(searchTerm.toLowerCase()) || b.govt_id?.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesStatus = true;
    if (filter === "incomplete") matchesStatus = !b.is_data_complete;
    if (filter === "highrisk") matchesStatus = b.is_high_risk;
    if (filter === "unassigned") matchesStatus = !b.assigned_asha_id;
    return matchesSearch && matchesStatus && (selectedVillage === "all" ? true : b.village === selectedVillage);
  });

  const stats = {
    total: data.length,
    unassigned: data.filter((b) => !b.assigned_asha_id).length,
    incomplete: data.filter((b) => !b.is_data_complete).length,
    highRisk: data.filter((b) => b.is_high_risk).length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-24">
      {/* 1. Summary Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-4 cursor-pointer transition-all ${filter === "all" ? "border-emerald-500 ring-1 ring-emerald-500" : "border-gray-100 hover:border-emerald-200"}`} onClick={() => setFilter("all")}>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Users size={20} /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">{isAshaMode ? t('cases.my_cases') : t('admin.total_registry')}</p>
            <p className="text-xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>

        <div className={`bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-4 cursor-pointer transition-all ${filter === "highrisk" ? "border-red-500 ring-1 ring-red-500" : "border-gray-100 hover:border-red-200"}`} onClick={() => setFilter("highrisk")}>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl"><ShieldAlert size={20} /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">{t('admin.high_risk_cases')}</p>
            <p className="text-xl font-bold text-gray-900">{stats.highRisk}</p>
          </div>
        </div>

        {!isAshaMode && (
          <div className={`bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-4 cursor-pointer transition-all ${filter === "unassigned" ? "border-amber-500 ring-1 ring-amber-500" : "border-gray-100 hover:border-amber-200"}`} onClick={() => setFilter("unassigned")}>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><UserCheck size={20} /></div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">{t('admin.pending_allocation')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.unassigned}</p>
            </div>
          </div>
        )}

        <div className={`bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-4 cursor-pointer transition-all ${filter === "incomplete" ? "border-rose-500 ring-1 ring-rose-500" : "border-gray-100 hover:border-rose-200"}`} onClick={() => setFilter("incomplete")}>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><ClipboardCheck size={20} /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">{t('admin.incomplete_records')}</p>
            <p className="text-xl font-bold text-gray-900">{stats.incomplete}</p>
          </div>
        </div>
      </div>

      {/* 2. Header & Filters */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">{isAshaMode ? t('cases.directory') : t('nav.beneficiaries')}</h1>
          <div className="flex flex-wrap items-center gap-3">
            {!isAshaMode && (
              <div className="flex items-center gap-2 bg-gray-50 border rounded-xl px-3 py-2">
                <MapPin size={14} className="text-emerald-500" />
                <select className="bg-transparent text-sm font-semibold outline-none pr-2" value={selectedVillage} onChange={(e) => setSelectedVillage(e.target.value)}>
                  <option value="all">All Villages</option>
                  {uniqueVillages.map((v) => (<option key={v} value={v}>{v}</option>))}
                </select>
              </div>
            )}
            <div className="flex bg-gray-100 p-1 rounded-xl border">
              <button onClick={() => setFilter("all")} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === "all" ? "bg-white shadow-sm text-emerald-600" : "text-gray-500"}`}>
                <List size={14} /> {t('common.all')}
              </button>
              <button onClick={() => setFilter("highrisk")} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === "highrisk" ? "bg-white shadow-sm text-red-600" : "text-gray-500"}`}>
                <ShieldAlert size={14} /> {t('dashboard.high_risk').toUpperCase()}
              </button>
              <button onClick={() => setFilter("unassigned")} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === "unassigned" ? "bg-white shadow-sm text-amber-600" : "text-gray-500"}`}>
                <UserCheck size={14} /> {t('admin.pending_allocation').toUpperCase()}
              </button>
              <button onClick={() => setFilter("incomplete")} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === "incomplete" ? "bg-white shadow-sm text-amber-600" : "text-gray-500"}`}>
                <AlertTriangle size={14} /> {t('cases.incomplete').toUpperCase()}
              </button>
            </div>
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white border border-emerald-200 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-50 shadow-sm">
              <FileText size={16} /> {t('cases.export')}
            </button>
          </div>
        </div>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={t('cases.search')}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-semibold"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 3. Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b text-gray-500 font-bold uppercase text-[10px] tracking-widest">
            <tr>
              {!isAshaMode && (
                <th className="px-6 py-4 w-10">
                  <button onClick={() => setSelectedIds(selectedIds.length === filteredData.length ? [] : filteredData.map((i) => i.id))} className="text-gray-400 hover:text-emerald-600">
                    {selectedIds.length === filteredData.length && filteredData.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>
                </th>
              )}
              <th className="px-6 py-4">{t('cases.table_ben')}</th>
              <th className="px-6 py-4">{t('cases.table_village')}</th>
              {!isAshaMode && <th className="px-6 py-4">{t('admin.workload')}</th>}
              <th className="px-6 py-4 text-right">{t('cases.table_action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-semibold">
            {filteredData.length > 0 ? (
              filteredData.map((b) => (
                <tr key={b.id} onClick={() => navigate(isAshaMode ? `/asha/beneficiary/${b.id}` : `/admin/beneficiary/${b.id}`)} className={`transition-colors cursor-pointer ${getAlertStatus(b.edd, b.assigned_asha_id, b.is_high_risk)}`}>
                  {!isAshaMode && (
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedIds.includes(b.id)} onChange={() => setSelectedIds((prev) => prev.includes(b.id) ? prev.filter((id) => id !== b.id) : [...prev, b.id])} className="rounded border-gray-300 text-emerald-600 h-4 w-4" />
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${b.is_high_risk ? "text-red-900" : "text-gray-900"}`}>{b.name}</span>
                      {b.is_high_risk && <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">{t('forms.high_risk_alert')}</span>}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">{b.govt_id || "NO ID"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-gray-600"><MapPin size={12} className="text-gray-300" /> {b.village || "---"}</span>
                  </td>
                  {!isAshaMode && (
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 font-bold ${b.asha_name ? "text-emerald-700" : "text-gray-300"}`}>
                        <UserCheck size={14} /> {b.asha_name || <span className="font-normal italic text-xs uppercase tracking-tighter">Needs ASHA</span>}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handleEditClick(b); }} className={`p-2 rounded-xl transition-all ${b.is_high_risk ? "text-red-600 hover:bg-red-200" : "text-emerald-600 hover:bg-emerald-100"}`}>
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" className="px-6 py-20 text-center text-gray-400 italic">No records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleUpdate} className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-black text-gray-900">{t('common.edit')}</h3>
              <button type="button" onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} /></button>
            </div>

            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div onClick={() => setEditData({ ...editData, is_high_risk: !editData.is_high_risk })} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${editData.is_high_risk ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200 bg-white text-gray-500"}`}>
                <div className="flex items-center gap-3">
                  <AlertCircle className={editData.is_high_risk ? "animate-pulse text-red-600" : "text-gray-300"} size={24} />
                  <div>
                    <p className="font-black text-sm uppercase tracking-wider">{t('forms.high_risk_alert')}</p>
                    <p className="text-[10px] opacity-80">{t('forms.mark_priority')}</p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${editData.is_high_risk ? "bg-red-600 border-red-600 text-white" : "border-gray-300"}`}>
                  {editData.is_high_risk && <Check size={14} strokeWidth={4} />}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">{t('forms.full_name')}</label>
                  <input className="w-full mt-1 p-3 bg-gray-50 border rounded-xl" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} required />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">{t('forms.govt_id')}</label>
                  <input className="w-full mt-1 p-3 bg-gray-50 border rounded-xl font-mono" value={editData.govt_id} onChange={(e) => setEditData({ ...editData, govt_id: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase">{t('forms.state')}</label>
                  <input className="w-full mt-1 p-3 bg-gray-50 border rounded-xl" value={editData.state} onChange={(e) => setEditData({ ...editData, state: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase">{t('forms.district')}</label>
                  <input className="w-full mt-1 p-3 bg-gray-50 border rounded-xl" value={editData.district} onChange={(e) => setEditData({ ...editData, district: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase">{t('forms.block')}</label>
                  <input className="w-full mt-1 p-3 bg-gray-50 border rounded-xl" value={editData.block} onChange={(e) => setEditData({ ...editData, block: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase">{t('forms.village')}</label>
                  <input className="w-full mt-1 p-3 bg-gray-50 border rounded-xl" value={editData.village} onChange={(e) => setEditData({ ...editData, village: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase">{t('forms.contact')}</label>
                  <input className="w-full mt-1 p-3 bg-gray-50 border rounded-xl" value={editData.contact_number} onChange={(e) => setEditData({ ...editData, contact_number: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase">{t('forms.edd')}</label>
                <input type="date" className="w-full mt-1 p-3 bg-gray-50 border rounded-xl" value={editData.edd} onChange={(e) => setEditData({ ...editData, edd: e.target.value })} />
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
              <button type="button" onClick={() => setSelectedUser(null)} className="px-6 py-2 text-gray-500 font-bold">{t('common.cancel')}</button>
              <button type="submit" disabled={loading} className="px-8 py-2 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {t('common.save')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BeneficiaryDirectory;
