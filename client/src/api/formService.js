// src/api/formService.js
import client from './client'; 

export const formService = {
  getDashboardForms: async (phase, beneficiaryId = null) => {
    const params = new URLSearchParams({ phase });
    if (beneficiaryId) params.append('beneficiary_id', beneficiaryId);
    
    // This calls GET /api/v1/forms/dashboard
    const response = await client.get(`/forms/dashboard?${params.toString()}`);
    return response.data;
  },

  getFormById: async (id) => {
  try {
    const response = await client.get(`/forms/${id}`);
    // Ensure you return the data part of the axios response
    return response.data; 
  } catch (error) {
    console.error("API Error fetching form:", error);
    throw error;
  }
}

};