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

const allowedOrigins = [
  'http://localhost:5173',                  // Local Development
  'https://niticare.vercel.app',    // Replace with Vercel URL
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy violation'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add this line right after CORS middleware
app.options('*', cors());


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