import * as authService from '../services/authServices.js';

export const login = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        status: "error",
        message: "Request body is missing"
      });
    }

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: "error",
        message: "Username and password are required"
      });
    }

    const data = await authService.authenticateUser(username, password);

    res.status(200).json({
      status: 'success',
      token: data.token,
      role: data.role,
      name: data.fullName
    });

  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: error.message
    });
  }
};



export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = req.user; // From your 'protect' middleware

    // Add token to blacklist
    await db('token_blacklist').insert({
      token: token,
      expires_at: new Date(decoded.exp * 1000) // Convert JWT exp to Date
    });

    res.status(200).json({ status: 'success', message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Logout failed' });
  }
};


export const forgotPassword = async (req, res) => {
  try {
    await authService.requestPasswordReset(req.body.email);
    res.status(200).json({ status: 'success', message: 'Token sent to email!' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    await authService.resetUserPassword(token, password);

    res.status(200).json({
      status: 'success',
      message: 'Password has been reset successfully. You can now log in.',
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};


export const signup = async (req, res) => {
  try {
    const newUser = await authService.registerUser(req.body);
    
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: { user: newUser }
    });
  } catch (error) {
    console.log(error),
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};