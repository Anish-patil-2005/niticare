import knex from 'knex';
import knexConfig from '../../knexfile.js';

// This checks if we are on Render (production) or your PC (development)
const environment = process.env.NODE_ENV || 'development';

const db = knex(knexConfig[environment]);

export default db;