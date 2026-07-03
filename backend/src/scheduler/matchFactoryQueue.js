const pool = require('../../config/db');
const { notifyQueue } = require('../queue/notifyQueue');

async function matchFactory(factoryId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get pending farmer registrations without an active pending assignment request
    const { rows: pendingFarmers } = await client.query(`
      SELECT fr.* FROM f_register fr
      WHERE fr.factory_id = $1 AND fr.status = 'pending'
        AND NOT EXISTS (
          SELECT 1 FROM assignment_request ar 
          WHERE ar.f_register_id = fr.id AND ar.status = 'pending'
        )
      ORDER BY fr.planting_date ASC, fr.crop_size ASC
      FOR UPDATE;
    `, [factoryId]);

    if (pendingFarmers.length === 0) {
      await client.query('COMMIT');
      return;
    }

    // Get idle machines registered to this factory
    const { rows: idleMachines } = await client.query(`
      SELECT * FROM machine_profile 
      WHERE factory_id = $1 AND status = 'idle'
      ORDER BY created_at ASC
      FOR UPDATE;
    `, [factoryId]);

    const pairCount = Math.min(pendingFarmers.length, idleMachines.length);

    for (let i = 0; i < pairCount; i++) {
      const fr = pendingFarmers[i];
      const machine = idleMachines[i];

      // Create assignment request with 24-hour expiry
      const { rows: request } = await client.query(`
        INSERT INTO assignment_request (factory_id, f_register_id, farmer_id, machine_id, status, expires_at)
        VALUES ($1, $2, $3, $4, 'pending', NOW() + INTERVAL '24 hours')
        RETURNING id;
      `, [factoryId, fr.id, fr.farmer_id, machine.id]);

      // Reserve the machine so it isn't double-matched
      await client.query(
        `UPDATE machine_profile SET status = 'reserved' WHERE id = $1;`,
        [machine.id]
      );

      // Lookup farmer's user_id for the notification target
      const { rows: farmerUser } = await client.query(
        'SELECT user_id FROM farmer_profile WHERE id = $1;',
        [fr.farmer_id]
      );

      // Queue notification to the farmer
      await notifyQueue.add('matchNotification', {
        factoryId,
        requestId: request[0].id,
        farmerUserId: farmerUser[0].user_id,
        machineUserId: machine.user_id,
        fRegisterId: fr.id
      });
    }

    await client.query('COMMIT');
    console.log(`[MatchFactory] Factory ${factoryId}: matched ${pairCount} pairs.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`[MatchFactory] Factory ${factoryId} error:`, err.message);
  } finally {
    client.release();
  }
}

module.exports = { matchFactory };