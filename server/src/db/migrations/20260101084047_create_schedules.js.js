export const up = function(knex) {
  return knex.schema.createTable('schedules', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.integer('beneficiary_id').notNullable();
    table.uuid('form_id').references('id').inTable('forms').onDelete('CASCADE');
    table.date('scheduled_date').notNullable();
    table.string('status').defaultTo('planned'); // planned, completed, missed
    table.timestamps(true, true);
    
    // Ensure one beneficiary can't have the same form scheduled multiple times
    table.unique(['beneficiary_id', 'form_id', 'status']); 
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('schedules');
};