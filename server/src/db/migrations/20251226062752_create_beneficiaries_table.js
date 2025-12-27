export const up = function(knex) {
  return knex.schema.createTable('beneficiaries', (table) => {
    table.increments('id').primary();
    
    // 1. Government Sync Fields
    table.string('govt_id').unique().nullable(); // Woman ID (Govt)
    table.string('name').notNullable();
    table.integer('age');
    table.string('contact_number');
    table.date('edd'); // Expected Delivery Date
    
    // Geographic Fields
    table.string('state').defaultTo('Maharashtra');
    table.string('district');
    table.string('block');
    table.string('village');
    
    // 2. Data Cleaning & Status
    table.boolean('is_data_complete').defaultTo(false);
    table.jsonb('medical_fields'); // Stores available medical history from Govt
    
    // 3. ASHA Allocation
    table.uuid('assigned_asha_id').unsigned().references('id').inTable('users').onDelete('SET NULL');

    table.timestamps(true, true);
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('beneficiaries');
};