// server/src/controllers/scheduleController.js
import db from "../db/knex.js";
// server/src/controllers/scheduleController.js
export const createOrUpdateSchedule = async (req, res) => {
  const { beneficiary_id, form_id, scheduled_date } = req.body;

  try {
    await db('schedules')
      .insert({
        beneficiary_id: parseInt(beneficiary_id),
        form_id: form_id, // Ensure this is a valid UUID string
        scheduled_date: scheduled_date,
        status: 'planned'
      })
      .onConflict(['beneficiary_id', 'form_id', 'status'])
      .merge({
        scheduled_date: scheduled_date,
        updated_at: db.fn.now()
      });

    res.status(200).json({ status: 'success' });
  } catch (error) {
    // If you see "invalid input syntax for type uuid", the form_id is the problem
    console.error("DB Error:", error.message); 
    res.status(500).json({ status: 'error', message: error.message });
  }
};


// server/src/controllers/scheduleController.js
export const getSchedulesByBeneficiary = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await db('schedules')
      .where({ beneficiary_id: id })
      .orderBy('scheduled_date', 'asc');
      
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};