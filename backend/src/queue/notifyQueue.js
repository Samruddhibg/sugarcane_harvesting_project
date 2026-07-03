const { Queue } = require('bullmq');
const connection = require('./connection');

const notifyQueue = new Queue('notifications', {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: true,
    removeOnFail: 500
  }
});

module.exports = { notifyQueue };