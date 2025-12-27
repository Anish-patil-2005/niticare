export const up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    // Professional: Use UUIDs for healthcare data security
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('username').unique().notNullable();
    table.string('password_hash').notNullable();
    
    // Module 0 Roles [cite: 7, 8, 9]
    table.enum('role', ['admin', 'asha', 'parent']).notNullable();
    
    table.string('full_name').notNullable();
    table.string('village').index(); // Indexed for Advanced Filtering [cite: 26, 32]
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true); // Adds created_at and updated_at
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('users');
};