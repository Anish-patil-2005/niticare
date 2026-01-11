import client from "./client";

export const reportService = {
  downloadExcel: async (endpoint, filters) => {
    try {
      const response = await client.get(endpoint, {
        params: filters,
        responseType: 'blob', // must
      });

      // const blob = response.data; // use data directly
      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;

      const reportName = endpoint.includes('performance') ? 'ASHA_Performance' : 'Beneficiary_Report';
      link.setAttribute('download', `NitiCare_${reportName}_${Date.now()}.xlsx`);

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export Error:", error);
      throw error;
    }
  }
};
