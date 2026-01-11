import db from '../db/knex.js'


export const getANCRecord = async (req, res) => {
  try {
    const { beneficiary_id, form_id, month_number, phase } = req.query;
    const bId = parseInt(beneficiary_id);
    
    // If no month_number is passed (or it's NaN), and it's Child phase,
    // return ALL history for that form.
    if (phase === 'child' || phase === 'child_care') {
  const history = await db('anc_records')
    .where({ beneficiary_id: bId, form_id })
    .orderBy('created_at', 'desc');
  
  // Make sure this is exactly what the frontend handleFetchHistory expects
  return res.status(200).json({ status: 'success', data: history });
}
    // Standard single-record logic for ANC
    const mNum = parseInt(month_number);
    let record = await db('anc_records')
      .where({ beneficiary_id: bId, form_id, month_number: mNum })
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
  const trx = await db.transaction();
  
  try {
    const { beneficiary_id, form_id, month_number, data, recordId } = req.body;
    const bId = parseInt(beneficiary_id);
    const mNum = parseInt(month_number);

    // --- 1. FIND EXISTING RECORD ---
    // We look for a record by ID or by the unique combination of Ben+Form+Month
    let existingRecord = null;

    if (recordId) {
      existingRecord = await trx('anc_records').where({ id: recordId }).first();
    } else {
      existingRecord = await trx('anc_records')
        .where({ 
          beneficiary_id: bId, 
          form_id: form_id, 
          month_number: mNum 
        })
        .first();
    }

    // --- 2. INSERT OR UPDATE ---
    if (existingRecord) {
      // UPDATE: Avoid creating a duplicate
      await trx('anc_records')
        .where({ id: existingRecord.id })
        .update({
          data: JSON.stringify(data),
          updated_at: trx.fn.now()
        });
    } else {
      // INSERT: Only if it doesn't exist
      await trx('anc_records').insert({
        beneficiary_id: bId,
        form_id: form_id,
        month_number: mNum,
        data: JSON.stringify(data),
        created_at: trx.fn.now(),
        updated_at: trx.fn.now()
      });
    }

    // --- 3. UPDATE SCHEDULE STATUS ---
    // We only update the schedule if it's currently 'planned'
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
    res.status(200).json({ 
      status: 'success', 
      message: existingRecord ? 'Record updated successfully' : 'New record created and schedule updated' 
    });

  } catch (error) {
    await trx.rollback();
    console.error("ANC Save Error:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
// server/src/controllers/recordController.js

export const getRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if ID is valid to prevent DB crash
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ status: 'error', message: 'Valid Record ID is required' });
    }

    const record = await db('anc_records').where({ id }).first();

    if (!record) {
      return res.status(404).json({ status: 'error', message: 'Record not found' });
    }

    res.status(200).json({ status: 'success', data: record });
  } catch (error) {
    console.error("Internal Error:", error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};