import fs from 'fs';
import csv from 'csv-parser';
import db from '../db/knex.js';
import bcrypt from 'bcryptjs';


export const importCsvData = async (filePath) => {
  const records = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // 1. Extract values and handle empty strings/whitespace
        const name = row['Name']?.trim();
        const rawAge = row['Age']?.trim();
        const govtId = row['Woman ID']?.trim();

        const state = row['State']?.trim() || null;
        const district = row['District']?.trim() || null;
        const block = row['Block']?.trim() || null;
        const village = row['Village']?.trim() || null;

        // 2. Skip row if Name is missing (Violates your .notNullable() constraint)
        const rawEdd = row['EDD']?.trim();

        // Logic to safely parse the date
        let formattedEdd = null;
        if (rawEdd) {
          const parsedDate = new Date(rawEdd);
          // Check if the date is valid (getTime() returns NaN for invalid dates)
          if (!isNaN(parsedDate.getTime())) {
            formattedEdd = parsedDate.toISOString().split('T')[0];
          } else {
            console.warn(`Skipping invalid date for ${name}: ${rawEdd}`);
            // Optionally handle how you want to store invalid dates (null vs default)
          }
        }
        
        // 1. Calculate the difference in days for EDD
        let isEddUrgent = false;
        if (formattedEdd) {
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Normalize today to midnight
          
          const eddDate = new Date(formattedEdd);
          const diffTime = eddDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // Logic: Today (0) or within the next 8 days
          isEddUrgent = diffDays >= 0 && diffDays <= 8;
        }

        // 2. Define medical risk keywords
        const medicalHistory = (row['Medical History'] || '').toLowerCase();
        const highRiskKeywords = ['anaemic', 'hypertension', 'bp', 'diabetes', 'thyroid', 'c-section'];
        const hasMedicalRisk = highRiskKeywords.some(keyword => medicalHistory.includes(keyword));

        // 3. Define age risk
        const ageInt = rawAge ? parseInt(rawAge, 10) : null;
        const isAgeRisk = ageInt && (ageInt < 18 || ageInt > 35);

        // 4. Final push to records
        records.push({
          govt_id: govtId,
          name,
          age: ageInt,
          contact_number: row['Phone']?.trim() || null,
          edd: formattedEdd,
          state,
          district,
          block,
          village: row['Village'] || null,
          is_data_complete: !!(name && formattedEdd && village && state && district),
          
          // High Risk logic: Combined check
          is_high_risk: !!(isEddUrgent || hasMedicalRisk || isAgeRisk),

          medical_fields: {
            history: row['Medical History'] || 'None',
            blood_group: row['Blood Group'] || 'Unknown'
          }
        });
    })
      .on('end', async () => {
        try {
          if (records.length === 0) {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return resolve(0);
          }

          // 4. Upsert into database
          await db('beneficiaries')
            .insert(records)
            .onConflict('govt_id') 
            .merge(); 

          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          resolve(records.length);
        } catch (err) {
          // Log the detailed error to your terminal
          console.error("DB Error Detail:", err.detail || err.message);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          reject(err);
        }
      })
      .on('error', (err) => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        reject(err);
      });
  });
};


// export const importAshaCsv = async (filePath) => {
//   const records = [];

//   return new Promise((resolve, reject) => {
//     fs.createReadStream(filePath)
//       .pipe(csv())
//       .on('data', (row) => {
//         // 1. Extract values based on CSV headers
//         const full_name = row['Full Name']?.trim();
//         const username = row['Username']?.trim();
//         const password = row['Password']?.trim();
//         const contact_number = row['Phone']?.trim();
//         const village = row['Village']?.trim();

//         // 2. Push to temporary array (we will hash passwords in the 'end' block)
//         if (username && password) {
//           records.push({
//             full_name,
//             username,
//             password, // temporary plain text
//             contact_number,
//             village,
//             role: 'asha',
//             is_active: true
//           });
//         }
//       })
//       .on('end', async () => {
//         try {
//           if (records.length === 0) {
//             if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
//             return resolve(0);
//           }

//           // 3. Hash passwords and prepare final records
//           // Using Promise.all so hashing happens in parallel (faster)
//           const finalRecords = await Promise.all(records.map(async (worker) => {
//             const salt = await bcrypt.genSalt(10);
//             const password_hash = await bcrypt.hash(worker.password, salt);
            
//             // Remove plain text password and add the hash
//             const { password, ...workerData } = worker;
//             return { ...workerData, password_hash };
//           }));

//           // 4. Batch Insert into 'users' table
//           // Note: .onConflict handles cases where a username might already exist
//           await db('users')
//             .insert(finalRecords)
//             .onConflict('username') 
//             .merge(); 

//           if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
//           resolve(finalRecords.length);
//         } catch (err) {
//           console.error("ASHA Import DB Error:", err.detail || err.message);
//           if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
//           reject(err);
//         }
//       })
//       .on('error', (err) => {
//         if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
//         reject(err);
//       });
//   });
// };

export const importAshaCsv = async (filePath) => {
  const records = [];
  console.log(`[SERVICE] 📂 Opening stream for: ${filePath}`);

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const full_name = row['Full Name']?.trim();
        const username = row['Username']?.trim();
        const password = row['Password']?.trim();
        const contact_number = row['Phone']?.trim();
        const village = row['Village']?.trim();

        if (username && password) {
          records.push({
            full_name,
            username,
            password, 
            contact_number,
            village,
            role: 'asha',
            is_active: true
          });
        }
      })
      .on('end', async () => {
        try {
          console.log(`[SERVICE] 📖 Finished reading CSV. Total records found: ${records.length}`);
          
          if (records.length === 0) {
            console.log("[SERVICE] ℹ️ Empty CSV or no valid rows. Cleaning up...");
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return resolve(0);
          }

          console.log("[SERVICE] 🔐 Hashing passwords and preparing DB batch...");
          const finalRecords = await Promise.all(records.map(async (worker) => {
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(worker.password, salt);
            const { password, ...workerData } = worker;
            return { ...workerData, password_hash };
          }));

          console.log("[SERVICE] 💾 Executing batch insert into 'users' table...");
          await db('users')
            .insert(finalRecords)
            .onConflict('username') 
            .merge(); 

          console.log("[SERVICE] 🗑️ Cleanup: Removing temporary file.");
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          resolve(finalRecords.length);
        } catch (err) {
          console.error("[SERVICE] ❌ Database Import Error:", err.message);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          reject(err);
        }
      })
      .on('error', (err) => {
        console.error("[SERVICE] ❌ File Stream Error:", err.message);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        reject(err);
      });
  });
};