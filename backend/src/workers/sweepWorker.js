const { Worker } = require('bullmq');
const connection = require('../queue/connection');
const pool = require('../../config/db');
const { matchFactory } = require('../scheduler/matchFactoryQueue');

let sweepWorker;

try {
  sweepWorker = new Worker('factory-matching-sweep', async () => {
    const { rows: factories } = await pool.query('SELECT id FROM factories;');
    for (const factory of factories) {
      await matchFactory(factory.id);
    }
  }, { connection, concurrency: 1 });
} catch (err) {
  console.warn('Sweep worker disabled.', err.message);
  sweepWorker = { close: async () => {} };
}

module.exports = sweepWorker;