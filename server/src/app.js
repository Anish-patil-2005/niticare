import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js'
import ashaRoutes from './routes/ashaRoutes.js';
import formRoutes from './routes/formRoutes.js';
// Load environment variables
dotenv.config();

const app = express();

// --- Global Middleware ---

// Enable CORS for your Next.js frontend
// --- Global Middleware ---

app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://niticare.vercel.app' 
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH', 'OPTIONS'], // OPTIONS is included here
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Body parser: Increase limit for the upcoming Govt Data Sync (CSV/JSON)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// --- Routes ---

// Versioned API routes for Module 0: Authentication
app.get('/test', (req, res) => res.send('Server is alive'));


// authroutes
app.use('/api/v1/auth', authRoutes);

//adminroutes
app.use('/api/v1/admin', adminRoutes);


//asharoutes
app.use('/api/v1/asha' ,ashaRoutes)

//form Routes
app.use('/api/v1/forms', formRoutes);


import recordRoutes from './routes/recordRoutes.js';

// ... other imports and middleware

app.use('/api/v1/records', recordRoutes);

import schedulesRoutes from './routes/schedulesRoutes.js'
app.use('/api/v1/schedules', schedulesRoutes);

import reportexportRoutes from './routes/reportexportRoutes.js'
app.use('/api/v1/reports', reportexportRoutes);

import ashalogsRoutes from './routes/asha_logsRoutes.js'
app.use('/api/v1/ashalogs', ashalogsRoutes);



// --- Global Error Handler ---
// This prevents the server from crashing and hides stack traces in production
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

export default app;