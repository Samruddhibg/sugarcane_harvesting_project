const { Worker } = require('bullmq');
const connection = require('../queue/connection');
const { matchFactory } = require('../scheduler/matchFactoryQueue');

let instantMatchWorker;

try {
  instantMatchWorker = new Worker('factory-matching-instant', async (job) => {
    await matchFactory(job.data.factoryId);
  }, { connection, concurrency: 10 });
} catch (err) {
  console.warn('Instant match worker disabled.', err.message);
  instantMatchWorker = { close: async () => {} };
}

module.exports = instantMatchWorker;