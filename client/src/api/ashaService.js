import client from './client';

/**
 * Service to handle ASHA/AWC Worker operations
 */
export const ashaService = {
  // Feature 1: Get list of beneficiaries assigned to the logged-in ASHA
  getAssignedBeneficiaries: async () => {
    return await client.get('/asha/my-beneficiaries');
  },

  // // Feature 2: Manual Registration
  registerBeneficiary: async (data) => {
    const res = await client.post('/asha/register', data);
    return res.data;
  },
  
  // Linked to ashaController.deleteManualBeneficiary
  deleteManualBeneficiary: async (id) => {
    const res = await client.delete(`/asha/delete-beneficiary/${id}`);
    return res.data;
  },

updateBeneficiary: (id, data) => {
  return client.patch(`/asha/update-beneficiary/${id}`, data);
},

 getBeneficiaryById: async (id) => {
  // Ensure this matches the backend route: /asha/beneficiary/:id
  const res = await client.get(`/asha/beneficiary/${id}`); 
  return res.data;
},


};