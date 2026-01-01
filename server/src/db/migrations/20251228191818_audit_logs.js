export const up = function(knex) {
  return knex.schema.createTable('audit_logs', (table) => {
    table.increments('id').primary();
    table.uuid('user_id').references('id').inTable('users'); // The ASHA/Admin who edited
    table.string('action'); // e.g., 'EDIT_BENEFICIARY', 'DELETE_MANUAL_BENEFICIARY'
    table.integer('beneficiary_id');
    table.jsonb('old_data');
    table.jsonb('new_data');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('audit_logs');
};