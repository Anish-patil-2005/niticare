// src/api/recordService.js
import client from './client';

export const recordService = {
  // Save or Update: Now accepts recordId and phase in the payload
  saveANCRecord: async (payload) => {
    // payload should include: { beneficiary_id, form_id, month_number, data, phase, recordId? }
    const res = await client.post('/records/save', payload);
    return res.data;
  },

  /**
   * Fetch records for a beneficiary.
   * If phase is 'child_care', this returns the full history list.
   * If month is provided, it targets a specific monthly record.
   */
  getExistingRecord: async (beneficiaryId, formId, month = 0, phase = 'anc') => {
    try {
      const res = await client.get('/records/get-single', {
        params: { 
          beneficiary_id: Number(beneficiaryId), 
          form_id: formId, 
          month_number: isNaN(Number(month)) ? 0 : Number(month),
          phase: phase // Added phase to tell backend to return history
        }
      });
      return res.data;
    } catch (error) {
      console.error("Error in getExistingRecord service:", error);
      throw error;
    }
  },

  // Specifically for fetching a single historical entry by ID if needed
  getRecordById: async (recordId) => {
    try {
      const res = await client.get(`/records/detail/${recordId}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching specific record:", error);
      throw error;
    }
  }
};