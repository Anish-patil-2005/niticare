// src/api/scheduleService.js
import client from './client'; 

export const scheduleService = {
  /**
   * Plans a visit for a specific form and beneficiary.
   * This calls POST /api/v1/schedules
   */
  // src/api/scheduleService.js
planVisit: async (beneficiaryId, formId, scheduledDate) => {
  try {
    const response = await client.post('/schedules', {
      beneficiary_id: beneficiaryId,
      form_id: formId,
      scheduled_date: scheduledDate
    });
    return response.data;
  } catch (error) {
    // Better error logging to see exactly what happened
    console.error("API Error Object:", error);
    
    // Throw a cleaner error message
    const message = error.response?.data?.message || "Server route not found (404)";
    throw new Error(message);
  }
},
  /**
   * Fetches all schedules for a specific beneficiary.
   * Useful if you want to see all planned dates at once.
   */
  getSchedulesByBeneficiary: async (beneficiaryId) => {
    try {
      const response = await client.get(`/schedules/beneficiary/${beneficiaryId}`);
      return response.data;
    } catch (error) {
      console.error("API Error fetching schedules:", error);
      throw error;
    }
  }
};