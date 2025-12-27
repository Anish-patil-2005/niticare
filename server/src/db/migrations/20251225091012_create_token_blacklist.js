export const up = function(knex) {
  return knex.schema.createTable('token_blacklist', (table) => {
    // The actual JWT string to be blocked
    table.string('token').primary();
    
    // When the token would have naturally expired
    // We use this to periodically clean up the table
    table.timestamp('expires_at').notNullable();
    
    // Useful for auditing
    table.timestamp('blacklisted_at').defaultTo(knex.raw('NOW()'));
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('token_blacklist');
};