export const up = async function(knex) {
  await knex.schema.raw(`
    ALTER TABLE forms 
    ALTER COLUMN month_number TYPE integer[] 
    USING ARRAY[month_number]::integer[]
  `);
};

export const down = async function(knex) {
  await knex.schema.raw(`
    ALTER TABLE forms 
    ALTER COLUMN month_number TYPE integer 
    USING month_number[1]
  `);
};