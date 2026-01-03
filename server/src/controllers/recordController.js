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
    const { beneficiary_id, form_id, month_number, data, recordId, phase } = req.body;
    const bId = parseInt(beneficiary_id);
    const mNum = parseInt(month_number);

    // CASE 1: EDITING A SPECIFIC ENTRY (No overwriting others)
    if (recordId) {
      console.log(`Updating specific record ID: ${recordId}`);
      await trx('anc_records')
        .where({ id: recordId })
        .update({
          data: JSON.stringify(data),
          updated_at: trx.fn.now()
        });
    } 
    // CASE 2: NEW ENTRY FOR CHILD CARE (Always create a new row)
    else if (phase === 'child' || phase === 'child_care') {
      console.log(`Creating new historical entry for child phase`);
      await trx('anc_records').insert({
        beneficiary_id: bId,
        form_id,
        month_number: mNum,
        data: JSON.stringify(data),
        created_at: trx.fn.now()
      });
    } 
    // CASE 3: STANDARD ANC (Maintain one record per month)
    else {
      const existing = await trx('anc_records')
        .where({ beneficiary_id: bId, form_id, month_number: mNum })
        .first();

      if (existing) {
        await trx('anc_records')
          .where({ id: existing.id })
          .update({
            data: JSON.stringify(data),
            updated_at: trx.fn.now()
          });
      } else {
        await trx('anc_records').insert({
          beneficiary_id: bId,
          form_id,
          month_number: mNum,
          data: JSON.stringify(data)
        });
      }
    }

    await trx.commit();
    res.status(200).json({ status: 'success', message: 'Record Processed' });
  } catch (error) {
    await trx.rollback();
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