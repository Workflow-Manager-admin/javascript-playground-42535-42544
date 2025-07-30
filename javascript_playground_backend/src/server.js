const app = require('./app');
const database = require('./services/database');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
  console.log(`API Documentation available at http://${HOST}:${PORT}/docs`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Graceful shutdown initiated...');
  
  server.close(async () => {
    console.log('HTTP server closed');
    
    try {
      await database.close();
      console.log('Database connections closed');
    } catch (error) {
      console.error('Error closing database connections:', error);
    }
    
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = server;
