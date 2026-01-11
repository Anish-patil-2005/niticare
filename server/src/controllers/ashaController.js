import db from '../db/knex.js';

export const getMyBeneficiaries = async (req, res) => {
  try {
    const ashaId = req.user.id; 

    const list = await db('beneficiaries')
      .where('assigned_asha_id', ashaId);

      res.json({ status: 'success', data: list });
  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({ message: "Error" });
  }
};


export const registerBeneficiary = async (req, res) => {
  try {
    const ashaId = req.user.id; 
    const { name, age, state,district,block, village,medical_fields, contact_number, edd, is_high_risk, govt_id } = req.body;

    
    const [newBeneficiary] = await db('beneficiaries').insert({
      name,
      age: parseInt(age), // Ensure age is an integer
      state,
      district,
      block,
      village,
      contact_number,
      edd,
      is_high_risk: is_high_risk || false,
      govt_id: govt_id || null,
      assigned_asha_id: ashaId,
      current_phase: 'antenatal',

      medical_fields: medical_fields || { history: '',blood_group: '' },

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
      updated_at: db.fn.now()
    });
    res.json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getAshaStats = async (req, res) => {
  try {
    const ashaId = req.user.id; 
    const today = new Date().toISOString().split('T')[0];
    
    // Dates for "Due this month"
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    const [total, highRisk, todayVisits, monthDue] = await Promise.all([
      // 1. My Beneficiaries
      db('beneficiaries').where('assigned_asha_id', ashaId).count('id as count').first(),

      // 2. High Risk Alerts
      db('beneficiaries').where({ assigned_asha_id: ashaId, is_high_risk: true }).count('id as count').first(),

      // 3. Today's Visits (Needs Join)
      db('schedules')
        .join('beneficiaries', 'schedules.beneficiary_id', 'beneficiaries.id')
        .where({
            'beneficiaries.assigned_asha_id': ashaId,
            'schedules.status': 'planned',
            'schedules.scheduled_date': today
        })
        .count('schedules.id as count').first(),

      // 4. Due This Month
      db('schedules')
        .join('beneficiaries', 'schedules.beneficiary_id', 'beneficiaries.id')
        .where('beneficiaries.assigned_asha_id', ashaId)
        .where('schedules.status', 'planned')
        .whereBetween('schedules.scheduled_date', [startOfMonth, endOfMonth])
        .count('schedules.id as count').first()
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        myBeneficiaries: parseInt(total?.count || 0),
        highRisk: parseInt(highRisk?.count || 0),
        todayVisits: parseInt(todayVisits?.count || 0),
        dueThisMonth: parseInt(monthDue?.count || 0)
      }
    });
  } catch (error) {
    console.error("ASHA Dashboard Error:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getTodayPriorityTasks = async (req, res) => {
  try {
    const ashaId = req.user.id;
    // Get today's date in local YYYY-MM-DD format
    const today = new Date().toLocaleDateString('en-CA'); 

    const tasks = await db('schedules')
      .join('beneficiaries', 'schedules.beneficiary_id', 'beneficiaries.id')
      .join('forms', 'schedules.form_id', 'forms.id')
      .where({
        'beneficiaries.assigned_asha_id': ashaId,
        'schedules.status': 'planned',
        'schedules.scheduled_date': today
      })
      .select([
        'schedules.id as schedule_id',
        'schedules.beneficiary_id', // Integer 37
        'schedules.form_id',        // UUID
        'forms.phase',
        'beneficiaries.name as beneficiary_name',
        'forms.title as form_name'
        // If you ever add month_number to schedules table, uncomment below:
        // 'schedules.month_number' 
      ]);

    res.status(200).json({ status: 'success', data: tasks });
  } catch (error) {
    console.error("Backend Task Error:", error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
};