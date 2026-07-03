const { Queue } = require('bullmq');
const connection = require('./connection');

const instantMatchQueue = new Queue('factory-matching-instant', {
  connection,
  defaultJobOptions: { removeOnComplete: true, removeOnFail: 100 }
});

async function triggerImmediateMatch(factoryId) {
  if (!factoryId) return;
  const jobId = `instant-match-factory-${factoryId}`;
  await instantMatchQueue.add('runMatch', { factoryId }, { jobId, delay: 3000 });
}

module.exports = { instantMatchQueue, triggerImmediateMatch };