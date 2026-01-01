export const up = function(knex) {
  return knex.schema.table('forms', (table) => {
    // 1. To track which card (1-9) the form appears in
    table.integer('month_number').nullable(); 

    // 2. To allow one form (like 'Vitals') to appear in every month card
    table.boolean('is_recurring').defaultTo(false); 

    // 3. To control the order of forms within a single month card
    table.integer('sort_order').defaultTo(0);
  });
};

export const down = function(knex) {
  return knex.schema.table('forms', (table) => {
    table.dropColumns('month_number', 'is_recurring', 'sort_order');
  });
};