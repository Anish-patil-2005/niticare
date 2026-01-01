export const up = function(knex) {
  return knex.schema.table('beneficiaries', (table) => {
    // 1. Status Indicators (Requirement 1)
    // We use enum to restrict values to only your specific requirements
    table.enum('status', ['active', 'delivered', 'follow-up']).defaultTo('active');
    
    // 2. High Risk Flag (Requirement 1)
    table.boolean('is_high_risk').defaultTo(false);
    
    // 3. Registration Source (Requirement 2 & 3)
    // Helps distinguish between CSV sync and ASHA manual entry
    table.enum('registration_source', ['govt_sync', 'asha_manual']).defaultTo('govt_sync');

    // 4. Current Phase (Requirement 4)
    // Drives the 3-tab dashboard logic later
    table.enum('current_phase', ['antenatal', 'postnatal', 'child_care']).defaultTo('antenatal');
  });
};

export const down = function(knex) {
  return knex.schema.table('beneficiaries', (table) => {
    table.dropColumns('status', 'is_high_risk', 'registration_source', 'current_phase');
  });
};