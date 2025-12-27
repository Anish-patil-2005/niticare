import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/knex.js';

export const authenticateUser = async (username, password) => {
  // 1. Find user in Postgres
  const user = await db('users').where({ username }).first();
  if (!user) throw new Error('Invalid credentials');

  // 2. Check Password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw new Error('Invalid credentials');

  // 3. Generate JWT (Role-Based)
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  return { token, role: user.role, fullName: user.full_name };
};



import crypto from 'crypto';
import sendEmail from '../utils/sendMail.js';

export const requestPasswordReset = async (email) => {
  const user = await db('users').where({ username: email }).first(); // Assuming username is email
  if (!user) throw new Error('User not found with this email');

  // 1. Create a reset token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // 2. Hash and set to database
  const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  await db('users').where({ id: user.id }).update({
    reset_password_token: passwordResetToken,
    reset_password_expires: new Date(Date.now() + 30 * 60 * 1000), // 30 mins
  });

  // 3. Send via email
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const message = `You requested a password reset. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.username,
      subject: 'NitiCare Password Reset Token',
      message,
    });
  } catch (err) {
    await db('users').where({ id: user.id }).update({
      reset_password_token: null,
      reset_password_expires: null,
    });
    throw new Error('Email could not be sent');
  }
};



export const resetUserPassword = async (token, newPassword) => {
  // 1. Hash the token provided in the URL to match the one in the DB
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // 2. Find user with valid token and check if token hasn't expired
  const user = await db('users')
    .where('reset_password_token', hashedToken)
    .andWhere('reset_password_expires', '>', new Date())
    .first();

  if (!user) {
    throw new Error('Token is invalid or has expired');
  }

  // 3. Hash the new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // 4. Update user and clear the reset fields
  await db('users').where({ id: user.id }).update({
    password_hash: hashedPassword,
    reset_password_token: null,
    reset_password_expires: null,
  });

  return user;
};



export const registerUser = async (userData) => {
  const { username, password, role, full_name, village } = userData;

  // 1. Check if user already exists
  const existingUser = await db('users').where({ username }).first();
  if (existingUser) {
    throw new Error('User already exists with this username/email');
  }

  // 2. Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 3. Insert into Database
  const [newUser] = await db('users').insert({
    username,
    password_hash: hashedPassword,
    role: role || 'parent', // Default to parent if no role specified
    full_name,
    village,
    is_active: true
  }).returning(['id', 'username', 'role', 'full_name']);

  return newUser;
};