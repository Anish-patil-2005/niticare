// src/api/recordService.js
import client from './client';

export const recordService = {
  // Save or Update
  saveANCRecord: async (payload) => {
    const res = await client.post('/records/save', payload);
    return res.data;
  },

  // Fetch specific record for editing
getExistingRecord: async (beneficiaryId, formId, month) => {
  try {
    const res = await client.get('/records/get-single', {
      params: { 
        // Force conversion to ensure the backend receives integers
        beneficiary_id: Number(beneficiaryId), 
        form_id: formId, 
        month_number: Number(month) 
      }
    });
    return res.data;
  } catch (error) {
    console.error("Error in getExistingRecord service:", error);
    throw error;
  }
}
};