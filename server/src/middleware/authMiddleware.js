import jwt from 'jsonwebtoken';
import db from '../db/knex.js';

export const protect = async (req, res, next) => {
  let token;

  // 1. Check if token exists in Authorization Header (Bearer Token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // 2. Check if token is Blacklisted (Logged out users)
      const isBlacklisted = await db('token_blacklist').where({ token }).first();
      if (isBlacklisted) {
        return res.status(401).json({ status: 'fail', message: 'Token is no longer valid. Please log in again.' });
      }

      // 3. Verify Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Attach User info to the Request object
      // This allows future controllers to know WHO is making the request
      req.user = {
        id: decoded.id,
        role: decoded.role
      };

      next();
    } catch (error) {
      return res.status(401).json({ status: 'fail', message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ status: 'fail', message: 'Not authorized, no token provided' });
  }
};

/**
 * Role-Based Access Control (RBAC)
 * @param  {...string} roles - e.g., 'admin', 'asha'
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // If user role is not in the allowed list, block them
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};