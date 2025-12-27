export const up = function(knex) {
  return knex.schema.createTable('forms', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable(); // e.g., "1st Trimester Checkup"
    table.string('phase').notNullable(); // "antenatal", "postnatal", "child_care"
    
    // This stores the structure: labels, types, validation rules
    table.jsonb('schema').notNullable(); 
    
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('forms');
};