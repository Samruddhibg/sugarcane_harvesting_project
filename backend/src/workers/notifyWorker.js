const { Worker } = require('bullmq');
const connection = require('../queue/connection');
const pool = require('../../config/db');
const io = require('../sockets/io');

let notifyWorker;

try {
  notifyWorker = new Worker('notifications', async (job) => {
    const socketServer = io.getIO();

    if (job.name === 'broadcastSystemMessage') {
      const { factoryId, farmerUserId, message } = job.data;
      
      await pool.query(`
        INSERT INTO notifications (user_id, factory_id, type, message)
        VALUES ($1, $2, 'FACTORY_BROADCAST', $3);
      `, [farmerUserId, factoryId, message]);

      if (socketServer) {
        socketServer.to(`user:${farmerUserId}`).emit('NOTIFICATION_RECEIVED', { message });
      }
    } else {
      const { factoryId, requestId, farmerUserId, machineUserId, fRegisterId } = job.data;
      const message = `Match optimization found! Assignment invitation ID ${requestId} is ready for review.`;

      await pool.query(`
        INSERT INTO notifications (user_id, factory_id, type, message)
        VALUES ($1, $2, 'ASSIGNMENT_PENDING', $3);
      `, [farmerUserId, factoryId, message]);

      if (socketServer) {
        socketServer.to(`user:${farmerUserId}`).emit('NOTIFICATION_RECEIVED', { message, requestId, fRegisterId });
        socketServer.to(`factory:${factoryId}`).emit('STATE_CHANGED', { type: 'MATCH_PROCESSED' });
      }
    }
  }, { connection, concurrency: 10 });
} catch (err) {
  console.warn('Notify worker disabled.', err.message);
  notifyWorker = { close: async () => {} };
}

module.exports = notifyWorker;