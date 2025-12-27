import app from './src/app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  🚀 NitiCare Backend Running
  📡 Port: ${PORT}
  Mode: ${process.env.NODE_ENV || 'development'}
  `);
});