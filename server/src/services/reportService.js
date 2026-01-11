import db from "../db/knex.js";
/**
 * FETCH EXPORT DATA: Detailed report joining Profile + Forms
 * Handles the "Many-to-One" relationship between Forms and Beneficiaries
 */
export const fetchExportData = async (filters, user) => {
  const { role, id: userId } = user;

  // Step 1: Base query for beneficiaries
  let query = db('beneficiaries as b')
    .leftJoin('users as u', 'b.assigned_asha_id', 'u.id')
    .leftJoin('anc_records as r', 'b.id', 'r.beneficiary_id')
    .leftJoin('forms as f', 'r.form_id', 'f.id')
    .select(
      'b.id as beneficiary_id',
      'b.name',
      'b.govt_id',
      'b.age',
      'b.village',
      'b.state',
      'b.district',
      'b.block',
      'b.edd',
      'b.is_high_risk',
      'b.is_data_complete',
      'b.current_phase',
      'b.registration_source',
      'u.full_name as asha_name',
      'f.title as form_title',
      'r.month_number',
      'r.data as form_data', // JSONB field
      'r.created_at as submission_date'
    );

  // Step 2: Role filters
  if (role === 'asha') query.where('b.assigned_asha_id', userId);

  // Step 3: Dynamic filters
  if (filters.village && filters.village !== 'all') query.where('b.village', filters.village);
  if (filters.is_high_risk === 'true' || filters.is_high_risk === true) query.where('b.is_high_risk', true);
  if (filters.is_data_complete === 'false') query.where('b.is_data_complete', false);
  if (role === 'admin' && filters.unassigned === 'true') query.whereNull('b.assigned_asha_id');
  if (role === 'admin' && filters.ashaId) query.where('b.assigned_asha_id', filters.ashaId);
  if (filters.phase) query.where('b.current_phase', filters.phase);

  // Step 4: Order by name + submission
  const rawData = await query.orderBy('b.name', 'asc').orderBy('r.created_at', 'desc');

  // Step 5: Flatten data for Excel
  const grouped = {}; // key = beneficiary_id
  rawData.forEach((row) => {
    if (!grouped[row.beneficiary_id]) {
      grouped[row.beneficiary_id] = {
        'Beneficiary Name': row.name,
        'Govt ID': row.govt_id || 'N/A',
        'Age': row.age,
        'State': row.state,
        'District': row.district,
        'Block': row.block,
        'Village': row.village,
        'EDD': row.edd ? new Date(row.edd).toLocaleDateString() : '-',
        'High Risk': row.is_high_risk ? 'YES' : 'No',
        'Data Quality': row.is_data_complete ? 'Complete' : 'Incomplete',
        'Current Phase': row.current_phase,
        'Assigned ASHA': row.asha_name || 'Unassigned',
        'Registration Source': row.registration_source || 'N/A',
        Forms: [], // Array of form data
      };
    }

    if (row.form_data) {
      const formObj = {};
      Object.keys(row.form_data).forEach((key) => {
        const column = `${row.form_title || 'Form'}_${key}`;
        formObj[column] = row.form_data[key];
      });
      formObj['Form Month'] = row.month_number || '-';
      formObj['Submission Date'] = row.submission_date ? new Date(row.submission_date).toLocaleDateString() : '-';
      grouped[row.beneficiary_id].Forms.push(formObj);
    }
  });

  // Step 6: Convert to array + flatten forms into columns
  const finalData = Object.values(grouped).map((b) => {
    const formColumns = {};
    b.Forms.forEach((f, idx) => {
      Object.keys(f).forEach((k) => {
        formColumns[`Form_${idx + 1}_${k}`] = f[k];
      });
    });
    return { ...b, ...formColumns };
  });

  return finalData;
};

/**
 * FETCH ASHA PERFORMANCE: Summarized Metrics
 * Uses Aggregation to count beneficiaries and forms per ASHA
 */
export const fetchAshaPerformance = async (filters) => {
  const query = db('users as u')
    .leftJoin('beneficiaries as b', 'u.id', 'b.assigned_asha_id')
    .leftJoin('anc_records as r', 'b.id', 'r.beneficiary_id')
    .where('u.role', 'asha')
    .select(
      'u.full_name as asha_name',
      'u.id as asha_id',
      'u.village as asha_village'
    )
    .countDistinct('b.id as total_beneficiaries')
    .count('r.id as total_forms_submitted')
    .groupBy('u.id', 'u.full_name', 'u.village');

  if (filters.village) {
    query.where('u.village', filters.village);
  }

  const performance = await query.orderBy('total_forms_submitted', 'desc');

  return performance.map(row => ({
    'ASHA Name': row.asha_name,
    'ASHA ID': row.asha_id,
    'Base Village': row.asha_village,
    'Beneficiaries Assigned': parseInt(row.total_beneficiaries) || 0,
    'Forms Submitted': parseInt(row.total_forms_submitted) || 0,
    'Performance Ratio': row.total_beneficiaries > 0 
      ? (row.total_forms_submitted / row.total_beneficiaries).toFixed(2) 
      : 0
  }));
};