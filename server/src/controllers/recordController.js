import db from '../db/knex.js'




export const getANCRecord = async (req, res) => {
  try {
    const { beneficiary_id, form_id, month_number } = req.query;
    const bId = parseInt(beneficiary_id);
    const mNum = parseInt(month_number);

    // 1. Try to find the record for the EXACT month requested
    let record = await db('anc_records')
      .where({ beneficiary_id: bId, form_id: form_id, month_number: mNum })
      .first();

    // 2. CARRY FORWARD LOGIC: 
    // If no record exists for this month, find the most recent previous month
    if (!record) {
      record = await db('anc_records')
        .where({ beneficiary_id: bId, form_id: form_id })
        .where('month_number', '<', mNum) // Only look at previous months
        .orderBy('month_number', 'desc')   // Get the most recent one
        .first();

      if (record) {
        console.log(`⏩ Carrying forward data from Month ${record.month_number} to Month ${mNum}`);
        // We clear the ID so the frontend doesn't accidentally think it's editing the old record
        delete record.id; 
        delete record.created_at;
        delete record.updated_at;
        record.is_carried_forward = true; // Flag for UI hint
      }
    }

    res.status(200).json({ status: 'success', data: record || null });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
export const saveANCRecord = async (req, res) => {
  // Start a transaction to ensure data integrity
  const trx = await db.transaction();
  
  try {
    const { beneficiary_id, form_id, month_number, data } = req.body;
    const bId = parseInt(beneficiary_id);
    const mNum = parseInt(month_number);

    const existing = await trx('anc_records')
      .where({ 
        beneficiary_id: bId, 
        form_id, 
        month_number: mNum 
      })
      .first();

    if (existing) {
      // 1. Update existing record
      await trx('anc_records')
        .where({ id: existing.id })
        .update({
          data: JSON.stringify(data),
          updated_at: trx.fn.now()
        });
    } else {
      // 2. Insert new record
      await trx('anc_records').insert({
        beneficiary_id: bId,
        form_id,
        month_number: mNum,
        data: JSON.stringify(data)
      });
    }

    // 3. CRITICAL: Mark the 'planned' schedule for this form as 'completed'
    // This removes the "Planned for: Date" text from the dashboard once the form is filled
    await trx('schedules')
      .where({ 
        beneficiary_id: bId, 
        form_id: form_id, 
        status: 'planned' 
      })
      .update({ 
        status: 'completed',
        updated_at: trx.fn.now()
      });

    await trx.commit();
    
    const message = existing ? 'Updated' : 'Saved';
    res.status(existing ? 200 : 201).json({ status: 'success', message });

  } catch (error) {
    await trx.rollback();
    console.error("Save Error:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};