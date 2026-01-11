import ExcelJS from 'exceljs';
import * as reportService from '../services/reportService.js';
import db from '../db/knex.js';


export const exportBeneficiariesExcel = async (req, res) => {
  try {
    const filters = req.query;
    const user = req.user;

    const data = await reportService.fetchExportData(filters, user);

    if (!data.length) return res.status(404).json({ message: 'No data found' });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Beneficiary Report');

    worksheet.columns = Object.keys(data[0]).map((key) => ({
      header: key,
      key: key,
      width: 20,
    }));

    worksheet.addRows(data);

    // Header styling
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=NitiCare_Beneficiaries_${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
};



export const exportAshaPerformanceExcel = async (req, res) => {
  try {
    const data = await reportService.fetchAshaPerformance(req.query);
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Staff Performance');

    worksheet.columns = Object.keys(data[0]).map(key => ({
      header: key, key: key, width: 25
    }));

    worksheet.addRows(data);
    
    // Indigo Header Styling
    worksheet.getRow(1).fill = {
      type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' }
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=ASHA_Performance_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};