// server/src/controllers/scheduleController.js
import db from "../db/knex.js";
export const createOrUpdateSchedule = async (req, res) => {
  const { beneficiary_id, form_id, scheduled_date } = req.body;

  try {
    // Upsert logic: If a plan exists, update it. If not, create it.
    await db('schedules')
      .insert({
        beneficiary_id,
        form_id,
        scheduled_date,
        status: 'planned'
      })
      .onConflict(['beneficiary_id', 'form_id', 'status'])
      .merge({
        scheduled_date: scheduled_date,
        updated_at: db.fn.now()
      });

    res.status(200).json({ status: 'success', message: 'Visit scheduled' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};