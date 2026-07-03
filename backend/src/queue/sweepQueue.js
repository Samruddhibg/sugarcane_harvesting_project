const { Queue } = require('bullmq');
const connection = require('./connection');

const sweepQueue = new Queue('factory-matching-sweep', {
  connection,
  defaultJobOptions: { removeOnComplete: true, removeOnFail: true }
});

async function initSweepCron() {
  await sweepQueue.add('globalSweep', {}, {
    repeat: { pattern: '*/15 * * * *' }
  });
}

module.exports = { sweepQueue, initSweepCron };