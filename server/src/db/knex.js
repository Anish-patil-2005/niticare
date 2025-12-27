import knex from 'knex';
import knexConfig from '../../knexfile.js';

// Use the development configuration
const db = knex(knexConfig.development);

export default db;