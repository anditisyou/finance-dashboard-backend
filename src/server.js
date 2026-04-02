import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start the HTTP server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`API docs available at http://localhost:${PORT}/api-docs`);
  });

  // Graceful shutdown on unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION:', err.message);
    server.close(() => process.exit(1));
  });

  // Graceful shutdown on SIGTERM (e.g. from Docker / Kubernetes)
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('Process terminated.');
      process.exit(0);
    });
  });
});
