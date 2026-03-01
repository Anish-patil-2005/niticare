import db from '../db/knex.js';

// Feature 1 
import { taskQueue } from '../queue_redis/taskQueue.js';

export const uploadGovtData = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }

    // 1. Hand off the CSV parsing to the background worker
    // We pass 'type' so the worker knows which logic to run
    await taskQueue.add('beneficiary-sync-job', {
      type: 'beneficiary-sync',
      filePath: req.file.path, 
    });

    // 2. Respond immediately to the Admin UI
    res.status(202).json({
      status: 'success',
      message: 'Beneficiary data sync started in the background. High-risk profiles are being calculated.',
    });
  } catch (error) {
    console.error("Controller Error:", error.message);
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

// export const updateBeneficiaryData = async (req, res) => {
//   const { id } = req.params;
//   try {
//     // Admin does NOT need the "assigned_asha_id" check
//     await db('beneficiaries').where({ id }).update({
//       ...req.body,
//       updated_at: db.fn.now()
//     });
//     res.json({ status: 'success', message: "Admin update successful" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const updateBeneficiaryData = async (req, res) => {
  const { id } = req.params;
  
  try {
    // 1. Manually pick ONLY the columns that exist in your local SQL table
    // This prevents "column does not exist" errors
    const updateData = {
      name: req.body.name,
      state: req.body.state,
      district: req.body.district,
      block: req.body.block,
      village: req.body.village,
      contact_number: req.body.contact_number,
      edd: req.body.edd,
      govt_id: req.body.govt_id,
      is_high_risk: req.body.is_high_risk,
      is_data_complete: req.body.is_data_complete,
      updated_at: new Date() 
    };

    // 2. Only add asha_id if it was actually sent (for Admin mode)
    if (req.body.assigned_asha_id !== undefined) {
      updateData.assigned_asha_id = req.body.assigned_asha_id;
    }

    const result = await db('beneficiaries')
      .where({ id })
      .update(updateData);

    if (result === 0) return res.status(404).json({ message: "Beneficiary not found" });

    res.json({ status: 'success', message: "Update successful" });
  } catch (error) {
    // Check your VS Code Terminal! This log is the key.
    console.error("CRITICAL SQL ERROR:", error.message);
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
/*export const exportBeneficiariesCSV = async (req, res) => {
  try {
    const { village } = req.query;

    let query = db('beneficiaries as b')
      .leftJoin('users as u', 'b.assigned_asha_id', 'u.id');

    if (village && village !== 'all') {
      query.where('b.village', village);
    }

    const beneficiaries = await query.select([
      'b.govt_id',
      'b.name',
      'b.age',
      'b.contact_number',
      'b.edd',
      'b.village',
      'b.is_data_complete',
      'u.full_name as asha_name'
    ]);

    if (!beneficiaries.length) {
      return res.status(404).json({ message: "No data available to export" });
    }

    const csvData = beneficiaries.map(row => ({
      'Government ID': row.govt_id || 'N/A',
      'Name': row.name || 'Unknown',
      'Age': row.age ?? '',
      'Contact': row.contact_number || '',
      'EDD': row.edd ? new Date(row.edd).toISOString().split('T')[0] : '',
      'Village': row.village || '',
      'Assigned ASHA': row.asha_name || 'Unassigned',
      'Status': row.is_data_complete ? 'Complete' : 'Incomplete'
    }));

    const parser = new Parser();
    const csv = parser.parse(csvData);

    // ✅ Add BOM for Excel
    const csvWithBom = `\uFEFF${csv}`;

    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment(`Beneficiary_Report_${Date.now()}.csv`);
    
    // Optional: Expose headers for Axios if you use custom filenames on the frontend
    res.header('Access-Control-Expose-Headers', 'Content-Disposition');

    return res.send(csvWithBom);

  } catch (error) {
    console.error("CSV Export Error:", error);
    res.status(500).json({ error: "Failed to generate CSV" });
  }
};*/

export const exportBeneficiariesCSV = async (req, res) => {
  try {
    const {
      village = 'all',
      is_high_risk,
      is_data_complete
    } = req.query;

    const query = db('beneficiaries as b')
      .leftJoin('users as u', 'b.assigned_asha_id', 'u.id');

    /* ---------------- Village Filter ---------------- */
    if (village !== 'all') {
      query.where('b.village', village);
    }

    /* ---------------- High Risk Filter ---------------- */
    if (is_high_risk !== undefined) {
      query.where('b.is_high_risk', is_high_risk === 'true');
    }

    /* ---------------- Status Filter ---------------- */
    if (is_data_complete !== undefined) {
      query.where('b.is_data_complete', is_data_complete === 'true');
    }

    const beneficiaries = await query.select([
      'b.govt_id',
      'b.name',
      'b.age',
      'b.contact_number',
      'b.edd',
      'b.village',
      'b.is_high_risk',
      'b.is_data_complete',
      'u.full_name as asha_name'
    ]);

    /* ---------------- CSV Mapping ---------------- */
    const csvData = beneficiaries.map(row => ({
      'Government ID': row.govt_id || 'N/A',
      'Name': row.name || 'Unknown',
      'Age': row.age ?? '',
      'Contact': row.contact_number || '',
      'EDD': row.edd
        ? new Date(row.edd).toISOString().split('T')[0]
        : '',
      'Village': row.village || '',
      'High Risk': row.is_high_risk ? 'Yes' : 'No',
      'Status': row.is_data_complete ? 'Complete' : 'Pending',
      'Assigned ASHA': row.asha_name || 'Unassigned'
    }));

    const parser = new Parser();
    const csv = '\uFEFF' + parser.parse(csvData);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="Beneficiary_Report.csv"'
    );
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

    return res.status(200).send(csv);
  } catch (error) {
    console.error("CSV Export Error:", error);
    res.status(500).json({ error: "Failed to export CSV" });
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

    // 1. The "Cheap" Check
    const check = await db('beneficiaries')
      .whereNull('assigned_asha_id')
      .whereRaw('LOWER(village) = ?', [village.toLowerCase()])
      .count('id as total')
      .first();

    const total = parseInt(check?.total || 0);

    // 2. Immediate Feedback if empty
    if (total === 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: `No unassigned beneficiaries found in ${village}` 
      });
    }

    // 3. The "Expensive" Work goes to the Worker
    await taskQueue.add('allocate-village', { 
      type: 'village', 
      village: village.trim(), 
      ashaId 
    });

    return res.status(202).json({ 
      status: 'success', 
      message: `Allocating ${total} beneficiaries in background...` 
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
export const allocateByLimit = async (req, res) => {
  try {
    const { limit, ashaId } = req.body;

    // 1. Quick check for availability
    const check = await db('beneficiaries')
      .whereNull('assigned_asha_id')
      .count('id as total')
      .first();

    const available = parseInt(check?.total || 0);

    if (available === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: "No unassigned beneficiaries left in the system." 
      });
    }

    // Determine how many we can actually assign
    const actualLimit = Math.min(parseInt(limit), available);

    await taskQueue.add('allocate-limit', { 
      type: 'limit', 
      limit: actualLimit, 
      ashaId 
    });

    res.status(202).json({ 
      status: 'success', 
      message: `Allocating ${actualLimit} beneficiaries in background.` 
    });
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
    const [total, unassigned, incomplete, highRisk] = await Promise.all([
      // 1. Total Registrations
      db('beneficiaries').count('id as count').first(),

      // 2. Pending Allocation
      db('beneficiaries').whereNull('assigned_asha_id').count('id as count').first(),

      // 3. Data Cleaning Needed
      db('beneficiaries').where({ is_data_complete: false }).count('id as count').first(),

      // 4. High Risk Cases (USING THE COLUMN DIRECTLY)
      db('beneficiaries')
        .where('is_high_risk', true) // or .where('is_high_risk', 1) for MySQL
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
    res.status(500).json({ status: 'error', message: error.message });
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

// 1. b) Add bulk add asha one go

// export const bulkAddAsha = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ status: 'error', message: 'No CSV file uploaded' });
//     }

//     // Pass the file path to the service
//     const recordCount = await dataSyncService.importAshaCsv(req.file.path);

//     res.status(200).json({
//       status: 'success',
//       message: `Onboarding complete. ${recordCount} ASHA workers registered successfully.`,
//     });
//   } catch (error) {
//     console.error("Bulk Registration Error:", error);
//     res.status(500).json({ status: 'error', message: error.message });
//   }
// };

// one go with redis queue
import { addAshaJob } from '../queue_redis/ashaQueue.js';

export const bulkAddAsha = async (req, res) => {
  try {
    if (!req.file) {
      console.error("[PRODUCER] ❌ Upload attempt without file.");
      return res.status(400).json({ status: 'error', message: 'No CSV file uploaded' });
    }

    console.log(`[PRODUCER] 📥 File received: ${req.file.originalname}. Queuing job...`);

    // Instead of awaiting the import, we push to Redis
    const job = await addAshaJob(req.file.path);

    console.log(`[PRODUCER] ✅ Job successfully added to Redis. JobID: ${job?.id}`);

    res.status(202).json({
      status: 'success',
      message: 'File uploaded successfully. Processing has started in the background.',
    });
  } catch (error) {
    console.error(`[PRODUCER] ❌ Failed to queue the job: ${error.message}`);
    res.status(500).json({ status: 'error', message: 'Failed to queue the job.' });
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
        'contact_number', 
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