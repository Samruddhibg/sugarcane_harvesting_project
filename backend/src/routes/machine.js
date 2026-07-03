const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const jwtAuth = require('../middleware/jwtAuth');
const { triggerImmediateMatch } = require('../queue/instantMatchQueue');

router.get('/machinedash', jwtAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT id FROM machine_profile WHERE user_id = $1;', [req.user.id]);
  res.json({ hasProfile: rows.length > 0 });
});

router.post('/machinedash/auth/register', jwtAuth, async (req, res) => {
  const { factory_id } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const prof = await client.query(`
      INSERT INTO machine_profile (user_id, name, phone, district, factory_id, status)
      VALUES ($1, $2, $3, $4, $5, 'idle') RETURNING id;
    `, [req.user.id, req.user.name, req.user.phone, req.user.district, factory_id]);
    
    await client.query('INSERT INTO m_register (machine_id, factory_id, name, phone, district) VALUES ($1,$2,$3,$4,$5);', [prof.rows[0].id, factory_id, req.user.name, req.user.phone, req.user.district]);
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

router.get('/machinedash/auth/home', jwtAuth, async (req, res) => {
  const { rows: profile } = await pool.query('SELECT * FROM machine_profile WHERE user_id = $1;', [req.user.id]);
  if (profile.length === 0) return res.status(400).json({ error: 'Asset profile missing' });
  const m = profile[0];

  const { rows: allocations } = await pool.query(`
    SELECT c.*, f.name as farmer_name, f.phone as farmer_phone FROM confirmed_assignment c
    JOIN farmer_profile f ON c.farmer_id = f.id WHERE c.machine_id = $1;
  `, [m.id]);

  res.json({ profile: m, allocations });
});

router.get('/machinedash/auth/notify', jwtAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC;', [req.user.id]);
  res.json({ logs: rows });
});

router.post('/machinedash/auth/toggle-status', jwtAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT id, status, factory_id FROM machine_profile WHERE user_id = $1;', [req.user.id]);
  if (rows.length === 0) return res.status(400).json({ error: 'Asset profile missing' });
  const m = rows[0];
  const newStatus = m.status === 'idle' ? 'busy' : 'idle';
  
  await pool.query('UPDATE machine_profile SET status = $1 WHERE id = $2;', [newStatus, m.id]);
  
  if (newStatus === 'idle') {
    const { rows: activeAssignments } = await pool.query("SELECT id, f_register_id FROM confirmed_assignment WHERE machine_id = $1 AND status = 'assigned';", [m.id]);
    
    for (const assignment of activeAssignments) {
      await pool.query("UPDATE confirmed_assignment SET status = 'finished', finished_at = NOW() WHERE id = $1;", [assignment.id]);
      await pool.query("UPDATE f_register SET status = 'finished' WHERE id = $1;", [assignment.f_register_id]);
    }

    const { triggerImmediateMatch } = require('../queue/instantMatchQueue');
    await triggerImmediateMatch(m.factory_id);
  }
  
  const { getIO } = require('../sockets/io');
  const io = getIO();
  if (io) io.to(`factory:${m.factory_id}`).emit('STATE_CHANGED');

  res.json({ success: true, status: newStatus });
});

router.post('/machinedash/auth/deactivate', jwtAuth, async (req, res) => {
  await pool.query('DELETE FROM machine_profile WHERE user_id = $1;', [req.user.id]);
  res.json({ success: true });
});

module.exports = router;