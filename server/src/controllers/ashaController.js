import db from '../db/knex.js';

export const getMyBeneficiaries = async (req, res) => {
  try {
    const ashaId = req.user.id; 
    console.log("Fetching for ASHA ID:", ashaId); // DEBUG 1

    const list = await db('beneficiaries')
      .where('assigned_asha_id', ashaId);

    console.log("Found records count:", list.length); // DEBUG 2
    res.json({ status: 'success', data: list });
  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({ message: "Error" });
  }
};


export const registerBeneficiary = async (req, res) => {
  try {
    const ashaId = req.user.id; 
    const { name, age, village, contact_number, edd, is_high_risk, govt_id } = req.body;

    
    const [newBeneficiary] = await db('beneficiaries').insert({
      name,
      age: parseInt(age), // Ensure age is an integer
      village,
      contact_number,
      edd,
      is_high_risk: is_high_risk || false,
      govt_id: govt_id || null,
      assigned_asha_id: ashaId,
      current_phase: 'antenatal',
      is_data_complete: true,
      status: 'active',
      registration_source: 'asha_manual' // Make sure this matches your enum!
    }).returning('*');

    res.status(201).json({ status: 'success', data: newBeneficiary });
  } catch (error) {
    console.error("Registration DB Error:", error);
    res.status(500).json({ message: "Database Error: " + error.message });
  }
};


export const deleteManualBeneficiary = async (req, res) => {
  const { id } = req.params;
  try {
    const record = await db('beneficiaries').where({ id }).first();

    // Restriction: Only delete manual entries
    if (record.registration_source !== 'asha_manual') {
      return res.status(403).json({ message: "Government records cannot be deleted" });
    }

    await db('beneficiaries').where({ id }).del();
    res.json({ status: 'success', message: "Manual record deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBeneficiaryById = async (req, res) => {
  try {
    const { id } = req.params;
    const ashaId = req.user.id;

    const beneficiary = await db('beneficiaries')
      .where({ id })
      .first();

    if (!beneficiary) {
      return res.status(404).json({ message: "Beneficiary not found" });
    }

    // Security: Ensure ASHA only sees their own assigned patients
    if (req.user.role === 'asha' && beneficiary.assigned_asha_id !== ashaId) {
      return res.status(403).json({ message: "Access denied to this record" });
    }

    res.json({ status: 'success', data: beneficiary });
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


export const updateMyBeneficiary = async (req, res) => {
  const { id } = req.params;
  const { id: userId } = req.user;
  try {

    const beneficiary = await db('beneficiaries').where({ id, assigned_asha_id: userId }).first();
    if (!beneficiary) return res.status(403).json({ message: "Not your record" });

    await db('beneficiaries').where({ id }).update({
      ...req.body,
      is_data_complete: true,
      updated_at: db.fn.now()
    });
    res.json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};