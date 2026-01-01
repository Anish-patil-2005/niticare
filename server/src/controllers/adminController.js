import * as dataSyncService from '../services/dataSyncService.js';
import db from '../db/knex.js';

// Feature 1 
export const uploadGovtData = async (req, res) => {
  try {
    // 1. Check if Multer actually found a file
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }

    // 2. Pass the local file path to the Service for parsing
    const recordCount = await dataSyncService.importCsvData(req.file.path);

    // 3. Respond to the Admin
    res.status(200).json({
      status: 'success',
      message: `Data sync complete. ${recordCount} records processed and imported.`,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};


// Feature 2 : 
// Get all beneficiaries with missing information
export const getIncompleteBeneficiaries = async (req, res) => {
  try {
    const data = await db('beneficiaries')
      .where({ is_data_complete: false })
      .select('id', 'govt_id', 'name', 'village', 'contact_number', 'edd');

    res.status(200).json({
      status: 'success',
      count: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateBeneficiaryData = async (req, res) => {
  const { id } = req.params;
  try {
    // Admin does NOT need the "assigned_asha_id" check
    await db('beneficiaries').where({ id }).update({
      ...req.body,
      updated_at: db.fn.now()
    });
    res.json({ status: 'success', message: "Admin update successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Feature 3 

export const getAllBeneficiaries = async (req, res) => {
  try {
    const { state, district, block, village, is_data_complete } = req.query;

    // Use a Left Join so beneficiaries appear even if they have NO ASHA assigned
    let query = db('beneficiaries as b')
      .leftJoin('users as u', 'b.assigned_asha_id', 'u.id')
      .select(
        'b.*', 
        'u.full_name as asha_name' // This is the missing piece for your table!
      );

    if (village) query = query.where('b.village', village);
    
    if (is_data_complete !== undefined) {
      query = query.where('b.is_data_complete', is_data_complete === 'true');
    }

    const data = await query.orderBy('b.created_at', 'desc');

    res.status(200).json({ status: 'success', count: data.length, data });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};


//Feature 4 
import { Parser } from 'json2csv';

export const exportBeneficiariesCSV = async (req, res) => {
  try {
    const { village } = req.query;

    let query = db('beneficiaries as b')
      .leftJoin('users as u', 'b.assigned_asha_id', 'u.id');

    if (village && village !== 'all') {
      query = query.where('b.village', village);
    }

    const rawData = await query.select({
      'Government ID': 'b.govt_id',
      'Name': 'b.name',
      'Age': 'b.age',
      'Contact': 'b.contact_number',
      'EDD': 'b.edd',
      'Village': 'b.village',
      'Assigned ASHA': 'u.full_name',
      'Data Complete': 'b.is_data_complete'
    });

    if (!rawData || rawData.length === 0) {
      return res.status(404).json({ message: "No data found for the selected filters" });
    }

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(rawData);

    // Set headers clearly
    res.header('Content-Type', 'text/csv');
    res.attachment(`Beneficiary_Report_${Date.now()}.csv`);
    return res.send(csv);

  } catch (error) {
    console.error("CSV Export Error:", error);
    res.status(500).json({ status: 'error', message: "Failed to generate CSV" });
  }
};

// Feature 5 
// A. Manual Allocation (Specific IDs)
export const allocateManual = async (req, res) => {
  try {
    const { beneficiaryIds, ashaId } = req.body;
    await db('beneficiaries')
      .whereIn('id', beneficiaryIds)
      .update({ assigned_asha_id: ashaId });

    res.status(200).json({ status: 'success', message: 'Manual allocation complete' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// B. Semi-Auto: Village Based (All women in a village to one ASHA)

export const allocateByVillage = async (req, res) => {
  try {
    const { village, ashaId } = req.body;

    const updatedCount = await db('beneficiaries')
      .where({ assigned_asha_id: null })
      .whereRaw('LOWER(village) = ?', [village.toLowerCase()])
      .update({ 
        assigned_asha_id: ashaId,
        updated_at: db.fn.now() 
      });

    if (updatedCount === 0) {
      // We return 400 because no work was actually done
      return res.status(400).json({ 
        status: 'error', 
        message: `No unassigned beneficiaries found in ${village}` 
      });
    }

    // IMPORTANT: Return a clear JSON success message
    return res.status(200).json({ 
      status: 'success', 
      message: `Successfully allocated ${updatedCount} beneficiaries to ASHA.`,
      count: updatedCount
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
// C. Semi-Auto: Limit Based (e.g., "First 50 unassigned women")
export const allocateByLimit = async (req, res) => {
  try {
    const { limit, ashaId } = req.body;

    // Subquery to get IDs of the next 'unassigned' women
    const unassignedIds = await db('beneficiaries')
      .whereNull('assigned_asha_id')
      .limit(limit)
      .select('id');

    const ids = unassignedIds.map(b => b.id);

    if (ids.length === 0) {
      return res.status(404).json({ message: "No unassigned beneficiaries left" });
    }

    await db('beneficiaries').whereIn('id', ids).update({ assigned_asha_id: ashaId });

    res.status(200).json({ status: 'success', message: `Allocated ${ids.length} women to ASHA` });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Feature 5 
export const getAssignments = async (req, res) => {
  try {
    const assignments = await db('beneficiaries as b')
      .join('users as u', 'b.assigned_asha_id', 'u.id')
      .select(
        'u.full_name as asha_name',
        'b.name as beneficiary_name',
        'b.village',
        'b.govt_id'
      )
      .orderBy('u.full_name');

    res.status(200).json({ status: 'success', data: assignments });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Fearture 6

export const getDashboardStats = async (req, res) => {
  try {
    // We execute all counters in parallel for maximum performance
    const [total, unassigned, incomplete, highRisk] = await Promise.all([
      // 1. Total Registrations
      db('beneficiaries').count('id as count').first(),

      // 2. Pending Allocation (Women not yet assigned to an ASHA)
      db('beneficiaries').whereNull('assigned_asha_id').count('id as count').first(),

      // 3. Data Cleaning Needed (Mandatory fields missing)
      db('beneficiaries').where({ is_data_complete: false }).count('id as count').first(),

      // 4. High Risk Cases
      // We cast JSONB to text using ::text to allow ILIKE searching
      db('beneficiaries')
        .where(db.raw('??::text ILIKE ?', ['medical_fields', '%High Risk%']))
        .orWhere(db.raw('??::text ILIKE ?', ['medical_fields', '%Anaemic%']))
        .orWhere(db.raw('??::text ILIKE ?', ['medical_fields', '%High BP%']))
        .count('id as count')
        .first()
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalPregnancies: parseInt(total?.count || 0),
        pendingAllocation: parseInt(unassigned?.count || 0),
        incompleteRecords: parseInt(incomplete?.count || 0),
        highRiskCases: parseInt(highRisk?.count || 0),
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch dashboard statistics',
      details: error.message 
    });
  }
};

// Feature 7 : add or deelte the asha worker
// 1. Create a new ASHA Worker
import bcrypt from 'bcryptjs';

export const addAshaWorker = async (req, res) => {
  try {
    const { full_name, username, password, contact_number, village } = req.body;

    // 1. Validation
    if (!username || !password) {
      return res.status(400).json({ message: "Username and Password are required" });
    }

    // 2. Hash the password before saving!
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 3. Insert into DB (matching your migration column names)
    const [newWorker] = await db('users').insert({
      full_name,
      username,         // Ensure this matches your migration
      password_hash,    // Ensure this matches your migration
      contact_number,   // If you ran the add_contact migration
      village,
      role: 'asha',     // Hardcoded role
      is_active: true
    }).returning('*');

    res.status(201).json({ status: 'success', data: newWorker });
  } catch (error) {
    console.error("Registration Error:", error);
    // Handle unique username error
    if (error.code === '23505') {
       return res.status(400).json({ message: "This username is already taken." });
    }
    res.status(500).json({ message: error.message });
  }
};
// 2. Delete an ASHA Worker
export const deleteAshaWorker = async (req, res) => {
  try {
    const { id } = req.params; // The UUID

    // Check if they have assigned beneficiaries first
    const linkedPatients = await db('beneficiaries').where({ assigned_asha_id: id }).count('id as count').first();
    
    if (parseInt(linkedPatients.count) > 0) {
      return res.status(400).json({ 
        message: "Cannot delete. This worker has assigned beneficiaries. Reassign them first." 
      });
    }

    await db('users').where({ id, role: 'asha' }).del();
    res.status(204).send(); // Success, no content
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 3. Get all ASHA workers with their workload
/**
 * Fetches all ASHA workers and calculates their current patient workload
 */
export const getAllAshas = async (req, res) => {
  try {
    // 1. Fetch workers using the exact column names from your migration
    const ashas = await db('users')
      .where({ role: 'asha' })
      .select(
        'id', 
        'full_name', 
        'username',   // Corrected from email
        'village', 
        'is_active', 
        'created_at'
      )
      .orderBy('created_at', 'desc');

    // 2. Fetch current workload (count of beneficiaries assigned to each ASHA)
    // This prevents the "n+1" query problem by getting all counts at once
    const workloads = await db('beneficiaries')
      .select('assigned_asha_id')
      .count('id as count')
      .groupBy('assigned_asha_id');

    // 3. Merge the counts into the worker objects
    const data = ashas.map(asha => {
      const workloadRecord = workloads.find(w => w.assigned_asha_id === asha.id);
      
      return {
        ...asha,
        // We add these helper fields so the Frontend doesn't break
        email: asha.username, 
        contact_number: asha.contact_number || 'No Contact', 
        workload: parseInt(workloadRecord?.count || 0)
      };
    });

    res.status(200).json({
      status: 'success',
      data: data
    });

  } catch (error) {
    console.error("Critical Backend Error (getAllAshas):", error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to synchronize ASHA registry',
      details: error.message 
    });
  }
};
// Feature 8 : add or delete the dynamic forms
export const createDynamicForm = async (req, res) => {
  try {
    const { title, phase, schema, month_number, is_recurring, sort_order } = req.body;

    // 1. Validation: Ensure schema is an array
    if (!Array.isArray(schema)) {
      return res.status(400).json({ message: "Form schema must be an array of fields" });
    }

    // 2. Format month_number as an Array for Postgres integer[]
    // If user sends a single number like 3, convert to [3]. 
    // If they send [3, 6], keep it as [3, 6].
    let monthsArray = null;
    if (month_number !== undefined && month_number !== null) {
      monthsArray = Array.isArray(month_number) ? month_number : [parseInt(month_number)];
    }

    // 3. Validation: Logic check for ANC forms
    if (phase === 'antenatal' && (!monthsArray || monthsArray.length === 0) && !is_recurring) {
      return res.status(400).json({ message: "Please assign at least one month or set as recurring for Antenatal forms" });
    }

    const [form] = await db('forms').insert({
      title,
      phase,
      schema: JSON.stringify(schema),
      // Knex handles Javascript arrays for Postgres integer[] columns automatically
      month_number: monthsArray, 
      is_recurring: is_recurring || false,
      sort_order: sort_order || 0
    }).returning('*');

    res.status(201).json({ status: 'success', data: form });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getFormsByPhase = async (req, res) => {
  try {
    const { phase } = req.params;
    const { month } = req.query; // Optional query param: ?month=3
    
    let query = db('forms');
    
    // If admin requests 'all', show everything.
    if (phase !== 'all') {
      query = query.where({ phase, is_active: true });

      // Logic for Filtering by Month (e.g., for Antenatal Card View)
      if (month) {
        query = query.andWhere(function() {
          this.where('month_number', month).orWhere('is_recurring', true);
        });
      }
    }
    
    // Ordered by sort_order first, then newest
    const forms = await query.orderBy('sort_order', 'asc').orderBy('created_at', 'desc');
    
    res.status(200).json({ status: 'success', data: forms });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const deleteForm = async (req, res) => {
  const trx = await db.transaction(); // Start a transaction
  try {
    const { id } = req.params;

    // 1. Delete all associated records first (The "Clean Sweep")
    await trx('anc_records').where({ form_id: id }).del();

    // 2. Delete the form itself
    const deletedCount = await trx('forms').where({ id }).del();

    if (deletedCount === 0) {
      await trx.rollback();
      return res.status(404).json({ status: 'error', message: 'Form not found' });
    }

    await trx.commit();
    res.status(200).json({ status: 'success', message: 'Form and associated test data deleted' });
  } catch (error) {
    await trx.rollback();
    res.status(500).json({ status: 'error', message: error.message });
  }
};
export const toggleFormStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const form = await db('forms').where({ id }).first();
    
    if (!form) return res.status(404).json({ message: "Form not found" });

    await db('forms').where({ id }).update({ is_active: !form.is_active });
    
    res.status(200).json({ 
        status: 'success', 
        message: `Form ${form.is_active ? 'deactivated' : 'activated'}` 
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};