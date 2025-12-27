/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/adminService';
import toast from 'react-hot-toast';
import { Users, MapPin, Hash, CheckCircle, ArrowRight, ClipboardList, UserCheck } from 'lucide-react';

const TaskAllocation = () => {
  const [ashas, setAshas] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedAsha, setSelectedAsha] = useState(""); 
  const [allocationType, setAllocationType] = useState("village");
  const [village, setVillage] = useState("");
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const ashasRes = await adminService.getAshaWorkers();
      const assignmentsRes = await adminService.getAssignments();
      
      const ashaList = ashasRes.data || ashasRes;
      const assignList = assignmentsRes.data || assignmentsRes;
      
      setAshas(Array.isArray(ashaList) ? ashaList : []);
      setAssignments(Array.isArray(assignList) ? assignList : []);
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Failed to load worker list");
    }
  };

  const handleAllocation = async (e) => {
    e.preventDefault();
    if (!selectedAsha) return toast.error("Please select an ASHA from the left list");

    // Add specific validation for Village Type
    if (allocationType === "village" && !village.trim()) {
      return toast.error("Please enter a village name");
    }

    setLoading(true);
    const loadId = toast.loading("Allocating...");

    // Update this specific block in your handleAllocation function
try {
  const payload = allocationType === "village" 
    ? { village: village.trim(), ashaId: selectedAsha } 
    : { limit: parseInt(limit), ashaId: selectedAsha };

  const res = allocationType === "village" 
    ? await adminService.allocateByVillage(payload)
    : await adminService.allocateByLimit(payload);
  
  // LOG THE RESPONSE to see what the backend is actually sending
  console.log("Allocation Response:", res);

  // Safely check for message
  const successMessage = res?.data?.message || res?.message || "Allocation Complete";
  
  toast.success(successMessage, { id: loadId });
  setVillage("");
  loadInitialData(); 
  
} catch (err) {
  console.error("Allocation Catch Block:", err);
  
  // Extract error message safely
  const errorMessage = err.response?.data?.message || err.message || "Allocation failed";
  toast.error(errorMessage, { id: loadId });
}finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Task Allocation</h1>
        <p className="text-gray-500 text-sm">Distribute beneficiary care tasks to ASHA workers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* STEP 1: SELECT WORKER (GREEN THEME) */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col h-[600px]">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-1">
            1. Select ASHA Worker
          </h2>
          <div className="space-y-2 overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {ashas.length > 0 ? (
              ashas.map((asha) => (
                <button
                  key={asha.id}
                  type="button"
                  onClick={() => setSelectedAsha(asha.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                    selectedAsha === asha.id
                      ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/20 shadow-sm"
                      : "border-gray-50 bg-white hover:border-emerald-200 hover:bg-emerald-50/30"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-900 text-sm leading-tight">
                        {asha.full_name}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1.5 uppercase font-medium tracking-wide">
                        <MapPin size={10} className="text-emerald-500" /> {asha.village || "No Village"}
                      </div>
                    </div>
                    {selectedAsha === asha.id && (
                      <CheckCircle size={16} className="text-emerald-600 animate-in zoom-in" />
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 font-mono">
                    ID: {asha.id.substring(0, 8)}...
                  </p>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Users size={32} className="mb-2 opacity-20" />
                <p className="text-xs italic">No workers found.</p>
              </div>
            )}
          </div>
        </div>

        {/* STEP 2: ALLOCATION BOX (GREEN THEME) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex border-b bg-gray-50/50">
              <button 
                type="button"
                onClick={() => setAllocationType("village")} 
                className={`flex-1 py-4 text-sm font-bold transition-all ${allocationType === 'village' ? 'bg-white text-emerald-700 border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Village Batch
              </button>
              <button 
                type="button"
                onClick={() => setAllocationType("limit")} 
                className={`flex-1 py-4 text-sm font-bold transition-all ${allocationType === 'limit' ? 'bg-white text-emerald-700 border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Fixed Limit
              </button>
            </div>

            <form onSubmit={handleAllocation} className="p-8">
              {allocationType === 'village' ? (
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-700">Assign unassigned women in specific village:</label>
                  <input 
                    className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="Enter village name (e.g. Shiroli)"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-700">Number of women to assign from queue:</label>
                  <input 
                    type="number"
                    className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                  />
                </div>
              )}
              <button 
                className="w-full mt-6 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? 'Allocating...' : 'Run Allocation'} <ArrowRight size={18}/>
              </button>
            </form>
          </div>

          {/* TABLE: ASSIGNMENT LOG (GREEN THEME) */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50/80 border-b flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <ClipboardList size={16} className="text-emerald-600" /> Assignment Log
              </h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="sticky top-0 bg-white shadow-sm text-gray-400 text-[10px] uppercase font-bold">
                  <tr>
                    <th className="px-6 py-3">ASHA Worker</th>
                    <th className="px-6 py-3">Beneficiary</th>
                    <th className="px-6 py-3">Village</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {assignments.length > 0 ? assignments.map((asgn, idx) => (
                    <tr key={idx} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-emerald-700">{asgn.asha_name}</td>
                      <td className="px-6 py-4 text-gray-900 font-medium">{asgn.beneficiary_name}</td>
                      <td className="px-6 py-4 text-gray-500">{asgn.village}</td>
                    </tr>
                  )) : (
                    <tr>
                       <td colSpan="3" className="px-6 py-10 text-center text-gray-400 italic">No assignments recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskAllocation;