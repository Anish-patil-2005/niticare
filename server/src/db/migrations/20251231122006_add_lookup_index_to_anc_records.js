/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function(knex) {
  return knex.schema.table('anc_records', (table) => {
    // 1. Drop the old, less specific index
    table.dropIndex(['beneficiary_id', 'month_number']);

    // 2. Add the optimized composite index including form_id
    table.index(['beneficiary_id', 'form_id', 'month_number'], 'idx_anc_records_lookup');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function(knex) {
  return knex.schema.table('anc_records', (table) => {
    table.dropIndex([], 'idx_anc_records_lookup');
    table.index(['beneficiary_id', 'month_number']);
  });
};