export const up = function(knex) {
  return knex.schema.alterTable('users', (table) => {
    table.string('reset_password_token').index();
    table.timestamp('reset_password_expires');
  });
};

export const down = function(knex) {
  return knex.schema.alterTable('users', (table) => {
    table.dropColumn('reset_password_token');
    table.dropColumn('reset_password_expires');
  });
};