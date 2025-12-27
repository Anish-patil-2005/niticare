import fs from 'fs';
import csv from 'csv-parser';
import db from '../db/knex.js';



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

records.push({
  govt_id: govtId,
  name,
  age: rawAge ? parseInt(rawAge, 10) : null,
  contact_number: row['Phone']?.trim() || null,
  edd: formattedEdd, // Use the safe variable here
  village: row['Village'] || null,
  is_data_complete: !!(name && formattedEdd && row['Village']), // Use the safe variable
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