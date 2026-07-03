const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const jwtAuth = require('../middleware/jwtAuth');
const { notifyQueue } = require('../queue/notifyQueue');

router.post('/factorydash/create', jwtAuth, async (req, res) => {
  const { name, district } = req.body;
  try {
    const { rows } = await pool.query('INSERT INTO factories (name, district, owner_user_id) VALUES ($1,$2,$3) RETURNING id;', [name, district, req.user.id]);
    res.json({ success: true, factoryId: rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/factorydash/auth/home', jwtAuth, async (req, res) => {
  const { rows: factories } = await pool.query('SELECT id FROM factories WHERE owner_user_id = $1;', [req.user.id]);
  if (factories.length === 0) return res.status(404).json({ error: 'No factory matching administrative role' });
  const fId = factories[0].id;

  const { rows: farmers } = await pool.query('SELECT p.* FROM farmer_profile p JOIN farmer_profile_factories pf ON p.id = pf.farmer_id WHERE pf.factory_id = $1;', [fId]);
  const { rows: machines } = await pool.query('SELECT * FROM machine_profile WHERE factory_id = $1;', [fId]);
  const { rows: fRegistrations } = await pool.query('SELECT * FROM f_register WHERE factory_id = $1;', [fId]);
  const { rows: mRegistrations } = await pool.query('SELECT * FROM m_register WHERE factory_id = $1;', [fId]);
  const { rows: activeRequests } = await pool.query('SELECT * FROM assignment_request WHERE factory_id = $1;', [fId]);
  
  const { rows: liveAssignments } = await pool.query(`
    SELECT c.*, 
           f.name as farmer_name, f.phone as farmer_phone, f.district as farmer_district,
           m.name as machine_name, m.phone as machine_phone, m.district as machine_district,
           r.crop_size, r.address
    FROM confirmed_assignment c
    JOIN farmer_profile f ON c.farmer_id = f.id
    JOIN machine_profile m ON c.machine_id = m.id
    JOIN f_register r ON c.f_register_id = r.id
    WHERE c.factory_id = $1;
  `, [fId]);

  res.json({ factoryId: fId, accounts: { farmers, machines }, intake: { fRegistrations, mRegistrations }, matchingFlows: { activeRequests, liveAssignments } });
});

router.post('/factorydash/auth/notify', jwtAuth, async (req, res) => {
  const { message } = req.body;
  const { rows: factories } = await pool.query('SELECT id FROM factories WHERE owner_user_id = $1;', [req.user.id]);
  if (factories.length === 0) return res.status(404).json({ error: 'Factory context required' });
  const factoryId = factories[0].id;

  const { rows: targets } = await pool.query(`
    SELECT p.user_id FROM farmer_profile p JOIN farmer_profile_factories pf ON p.id = pf.farmer_id WHERE pf.factory_id = $1 
    UNION DISTINCT 
    SELECT user_id FROM machine_profile WHERE factory_id = $1;
  `, [factoryId]);

  for (const t of targets) {
    await notifyQueue.add('broadcastSystemMessage', { factoryId, farmerUserId: t.user_id, message });
  }
  res.json({ success: true, targetedReceptors: targets.length });
});

module.exports = router;