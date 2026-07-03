const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const jwtAuth = require('../middleware/jwtAuth');
const { triggerImmediateMatch } = require('../queue/instantMatchQueue');

router.get('/farmerdash', jwtAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT id FROM farmer_profile WHERE user_id = $1;', [req.user.id]);
  res.json({ hasProfile: rows.length > 0 });
});

router.get('/farmerdash/auth/register', jwtAuth, async (req, res) => {
  res.json({ baseIdentity: { name: req.user.name, phone: req.user.phone, district: req.user.district } });
});

router.post('/farmerdash/profile', jwtAuth, async (req, res) => {
  const { factory_ids } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const prof = await client.query(`
      INSERT INTO farmer_profile (user_id, name, phone, district)
      VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET name = $2 RETURNING id;
    `, [req.user.id, req.user.name, req.user.phone, req.user.district]);
    
    const fId = prof.rows[0].id;
    await client.query('DELETE FROM farmer_profile_factories WHERE farmer_id = $1;', [fId]);
    for (const facId of factory_ids) {
      await client.query('INSERT INTO farmer_profile_factories (farmer_id, factory_id) VALUES ($1, $2);', [fId, facId]);
    }
    await client.query('COMMIT');
    res.json({ success: true, profileId: fId });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.post('/farmerdash/auth/register', jwtAuth, async (req, res) => {
  const { address, planting_date, crop_size, factory_id } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: profile } = await client.query('SELECT id FROM farmer_profile WHERE user_id = $1;', [req.user.id]);
    if (profile.length === 0) throw new Error('Farmer profile not found. Complete onboarding first.');
    const fId = profile[0].id;
    
    await client.query(`
      INSERT INTO f_register (farmer_id, factory_id, name, phone, district, address, planting_date, crop_size, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending');
    `, [fId, factory_id, req.user.name, req.user.phone, req.user.district, address, planting_date, crop_size]);
    
    await client.query('COMMIT');
    await triggerImmediateMatch(factory_id);
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.get('/farmerdash/auth/home', jwtAuth, async (req, res) => {
  const { rows: profile } = await pool.query('SELECT id FROM farmer_profile WHERE user_id = $1;', [req.user.id]);
  if (profile.length === 0) return res.status(400).json({ error: 'Profile must be registered' });
  const fId = profile[0].id;

  const { rows: requests } = await pool.query(`
    SELECT r.*, m.name as machine_name, m.phone as machine_phone 
    FROM assignment_request r JOIN machine_profile m ON r.machine_id = m.id
    WHERE r.farmer_id = $1;
  `, [fId]);

  const { rows: confirmed } = await pool.query(`
    SELECT c.*, m.name as machine_name, m.phone as machine_phone 
    FROM confirmed_assignment c JOIN machine_profile m ON c.machine_id = m.id
    WHERE c.farmer_id = $1;
  `, [fId]);

  const { rows: crops } = await pool.query('SELECT * FROM f_register WHERE farmer_id = $1 ORDER BY submission_date DESC;', [fId]);

  res.json({ requests, confirmed, crops });
});

router.post('/farmerdash/auth/assignment/:id/respond', jwtAuth, async (req, res) => {
  const { decision } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: requests } = await client.query('SELECT * FROM assignment_request WHERE id = $1 AND status = \'pending\' FOR UPDATE;', [req.params.id]);
    if (requests.length === 0) throw new Error('Request un-schedulable or expired');
    const r = requests[0];

    if (decision === 'accept') {
      await client.query('UPDATE assignment_request SET status = \'accepted\', responded_at = NOW() WHERE id = $1;', [r.id]);
      await client.query('UPDATE f_register SET status = \'assigned\' WHERE id = $1;', [r.f_register_id]);
      await client.query('UPDATE machine_profile SET status = \'busy\' WHERE id = $1;', [r.machine_id]);
      await client.query('INSERT INTO confirmed_assignment (factory_id, farmer_id, machine_id, f_register_id, status) VALUES ($1,$2,$3,$4,\'assigned\');', [r.factory_id, r.farmer_id, r.machine_id, r.f_register_id]);

      const { rows: farmData } = await client.query('SELECT f.*, p.user_id FROM f_register f JOIN farmer_profile p ON f.farmer_id = p.id WHERE f.id = $1;', [r.f_register_id]);
      const { rows: machData } = await client.query('SELECT * FROM machine_profile WHERE id = $1;', [r.machine_id]);
      
      if (farmData.length > 0 && machData.length > 0) {
        const f = farmData[0];
        const m = machData[0];
        
        const machineMsg = `Assignment Confirmed! You are assigned to farmer ${f.name}. Contact: ${f.phone}. Address: ${f.address}. Crop Size: ${f.crop_size} Ha. Planting Date: ${new Date(f.planting_date).toLocaleDateString()}.`;
        await client.query(`
          INSERT INTO notifications (user_id, factory_id, type, message) 
          VALUES ($1, $2, 'assignment_confirmed', $3)
        `, [m.user_id, r.factory_id, machineMsg]);

        const farmerMsg = `Your harvest assignment is confirmed. Machine operator ${m.name} is assigned to you. Contact: ${m.phone}.`;
        await client.query(`
          INSERT INTO notifications (user_id, factory_id, type, message) 
          VALUES ($1, $2, 'assignment_confirmed', $3)
        `, [f.user_id, r.factory_id, farmerMsg]);
      }
    } else {
      await client.query('UPDATE assignment_request SET status = \'rejected\', responded_at = NOW() WHERE id = $1;', [r.id]);
      await client.query('UPDATE f_register SET status = \'pending\' WHERE id = $1;', [r.f_register_id]);
      await client.query('UPDATE machine_profile SET status = \'idle\' WHERE id = $1;', [r.machine_id]);
      
      // Store rejection msg in notifications as requested
      await client.query(`
        INSERT INTO notifications (user_id, factory_id, type, message) 
        VALUES ($1, $2, 'assignment_rejected', 'You rejected the machine assignment request for machine #' || $3)
      `, [req.user.id, r.factory_id, r.machine_id]);
    }
    await client.query('COMMIT');
    await triggerImmediateMatch(r.factory_id);
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.get('/farmerdash/profile', jwtAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM farmer_profile WHERE user_id = $1;', [req.user.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Profile missing' });
  const fId = rows[0].id;
  const { rows: facs } = await pool.query('SELECT factory_id FROM farmer_profile_factories WHERE farmer_id = $1;', [fId]);
  const factoryIds = facs.map(f => f.factory_id);
  res.json({ profile: { ...rows[0], factory_ids: factoryIds } });
});

router.get('/farmerdash/auth/notify', jwtAuth, async (req, res) => {
  const { rows: profile } = await pool.query('SELECT id FROM farmer_profile WHERE user_id = $1;', [req.user.id]);
  if (profile.length === 0) return res.json({ pendingRequests: [], logs: [] });
  
  const fId = profile[0].id;
  
  // Pending assignment requests for farmer to accept/reject
  const { rows: pendingRequests } = await pool.query(`
    SELECT r.*, m.name as machine_name, m.phone as machine_phone 
    FROM assignment_request r JOIN machine_profile m ON r.machine_id = m.id
    WHERE r.farmer_id = $1 AND r.status = 'pending';
  `, [fId]);

  // Read rejection notifications
  const { rows: logs } = await pool.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC;', [req.user.id]);
  
  res.json({ pendingRequests, logs });
});

router.post('/farmerdash/auth/deactivate', jwtAuth, async (req, res) => {
  await pool.query('DELETE FROM farmer_profile WHERE user_id = $1;', [req.user.id]);
  res.json({ success: true });
});

module.exports = router;