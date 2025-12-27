export const up = function(knex) {
  return knex.schema.table('users', (table) => {
    table.string('contact_number', 20); // Adds the missing column
  });
};

export const down = function(knex) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('contact_number');
  });
};