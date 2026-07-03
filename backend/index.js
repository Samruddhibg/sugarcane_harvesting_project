const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const pool = require('./config/db');
const ioServer = require('./src/sockets/io');

// Workers activation triggers
require('./src/workers/instantMatchWorker');
require('./src/workers/sweepWorker');
require('./src/workers/notifyWorker');
const { initSweepCron } = require('./src/queue/sweepQueue');

const publicRoutes = require('./src/routes/public');
const farmerRoutes = require('./src/routes/farmer');
const machineRoutes = require('./src/routes/machine');
const factoryRoutes = require('./src/routes/factory');

const app = express();
app.use(cors({ 
  origin: function(origin, callback) { return callback(null, true); }, 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

app.use(publicRoutes);
app.use(farmerRoutes);
app.use(machineRoutes);
app.use(factoryRoutes);

const server = http.createServer(app);
server.on('error', (err) => {
  console.error('Server error:', err);
});

console.log('Initializing socket server...');
ioServer.init(server);

const PORT = process.env.PORT || 5000;
console.log(`Attempting to listen on port ${PORT}...`);
server.listen(PORT, async () => {
  console.log(`Server executing successfully on port ${PORT}`);
  try {
    await initSweepCron();
    console.log('Background safety cron tasks activated.');
  } catch (err) {
    console.error('Failed to bind repeat cron tasks:', err);
  }
});