import bcrypt from 'bcryptjs';

export const seed = async function(knex) {
  // Clear existing users to prevent duplicates during dev
  await knex('users').del();

  const hashedPassword = await bcrypt.hash('Admin@niticare123', 10);

  await knex('users').insert([
    {
      username: 'govt_admin',
      password_hash: hashedPassword,
      role: 'admin',
      full_name: 'System Administrator',
      is_active: true
    }
  ]);
};