/* eslint-disable no-unused-vars */
import client from './client';

export const adminService = {
  // --- FEATURE: DASHBOARD & ANALYTICS ---
  getDashboardStats: async () => {
    const response = await client.get('/admin/dashboard');
    return response.data; 
  },

  // --- FEATURE: ASHA MANAGEMENT ---
  getAshaWorkers: async () => {
    const response = await client.get('/admin/ashas');
    return response.data;
  },

  addAshaWorker: async (data) => {
    return await client.post('/admin/ashas', data);
  },

  deleteAshaWorker: async (id) => {
    return await client.delete(`/admin/ashas/${id}`);
  },

  // --- FEATURE: DATA SYNC (GOVT DATA UPLOAD) ---
  syncGovtData: async (formData) => {
    return await client.post('/admin/sync-data', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // --- FEATURE: BENEFICIARY DIRECTORY ---
  getBeneficiaries: async () => {
    return await client.get('/admin/beneficiaries');
  },

  getBeneficiaries_incomplete: () => {
    return client.get('/admin/incomplete-data');
  },

  updateBeneficiary: (id, data) => {
    return client.patch(`/admin/update-beneficiary/${id}`, data);
  },

  // --- FEATURE: ALLOCATION ENGINE ---
  getAssignments: () => {
    return client.get('/admin/assignments');
  },

  allocateManual: (data) => {
    return client.post('/admin/allocate/manual', data);
  },

  allocateByVillage: (data) => {
    return client.post('/admin/allocate/village', data);
  },

  allocateByLimit: (data) => {
    return client.post('/admin/allocate/limit', data);
  },

  // --- FEATURE: REPORTING & EXPORT ---
  exportCSV: (village) => {
    return client.get(`/admin/export-csv`, {
      params: { village: village === 'all' ? undefined : village },
      responseType: 'blob', 
      headers: {
        'Accept': 'text/csv'
      }
    });
  },

  // --- FEATURE: DYNAMIC FORM BUILDER ---
  
  /**
   * Creates a new medical form schema
   * @param {Object} formData - { title, phase, schema: [] }
   */
  createDynamicForm: async (formData) => {
    return await client.post('/admin/forms', formData);
  },

 // adminService.js (Updated segment)

getFormsByPhase: async (phase) => {
  const response = await client.get(`/admin/forms/${phase}`);
  // If your controller returns res.status(200).json({ status: 'success', data: forms })
  // Axios puts that whole JSON into response.data
  return response.data; 
},

getAllForms: async () => {
  const response = await client.get('/admin/forms/all');
  return response.data.data; // Return the nested array
},

  /**
   * Toggles a form between Active and Inactive
   * Recommended over deletion to keep medical history intact.
   */
  toggleFormStatus: async (id) => {
    return await client.patch(`/admin/forms/${id}/toggle`);
  },

  /**
   * Permanently deletes a form (will fail if responses are linked)
   */
  deleteForm: async (id) => {
    return await client.delete(`/admin/forms/${id}`);
  },

  
  
};