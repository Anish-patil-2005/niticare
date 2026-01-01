export const up = function(knex) {
  return knex.schema.createTable('anc_records', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // CHANGE THIS: Match it to the integer type of the beneficiaries table
    table.integer('beneficiary_id').unsigned().notNullable();
    table.foreign('beneficiary_id').references('id').inTable('beneficiaries').onDelete('CASCADE');
    
    // Keep this as UUID because your 'forms' table uses UUID
    table.uuid('form_id').references('id').inTable('forms').onDelete('RESTRICT');
    
    table.integer('month_number').notNullable();
    table.jsonb('data').notNullable(); // Stores form answers
    table.timestamps(true, true);

    // Speed up lookups for a specific mother
    table.index(['beneficiary_id', 'month_number']);
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('anc_records');
};