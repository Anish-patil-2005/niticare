import db from '../db/knex.js';


// server/src/controllers/formController.js
export const getDashboardForms = async (req, res) => {
  try {
    const { phase, beneficiary_id } = req.query;

    const forms = await db('forms as f')
      .leftJoin('schedules as s', function() {
        this.on('s.form_id', '=', 'f.id')
            .andOn('s.beneficiary_id', '=', db.raw('?', [beneficiary_id]))
            .andOn('s.status', '=', db.raw('?', ['planned']));
      })
      .leftJoin('anc_records as r', function() {
        this.on('r.form_id', '=', 'f.id')
            .andOn('r.beneficiary_id', '=', db.raw('?', [beneficiary_id]));
      })
      .where('f.phase', phase)
      .where('f.is_active', true)
      .select(
        'f.*',
        's.scheduled_date as planned_date',
        's.id as schedule_id',
        // Returns a boolean for simple forms
        db.raw('COUNT(r.id) > 0 as is_completed'),
        // Returns an array of months for recurring forms (e.g., [1, 2, 5])
        db.raw('JSON_ARRAYAGG(r.month_number) as completed_months')
      )
      .groupBy('f.id', 's.scheduled_date', 's.id')
      .orderBy('f.sort_order', 'asc');

    // Cleanup: MySQL JSON_ARRAYAGG returns [null] if no records exist, we want []
    const formattedForms = forms.map(form => ({
      ...form,
      completed_months: (form.completed_months || []).filter(m => m !== null),
      is_completed: !!form.is_completed // Ensure boolean
    }));

    res.status(200).json({ status: 'success', data: formattedForms });
  } catch (error) {
    console.error("Dashboard Fetch Error:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
// server/src/controllers/formController.js
export const getFormById = async (req, res) => {
  const { id } = req.params;
  const form = await db('forms').where({ id }).first();
  
  if (!form) {
    return res.status(404).json({ status: 'error', message: 'Form not found' });
  }

  // The frontend expects this: { status: 'success', data: { id, title, schema... } }
  res.status(200).json({ status: 'success', data: form });
};