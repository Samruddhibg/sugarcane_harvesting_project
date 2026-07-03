const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../../config/db');
const jwtAuth = require('../middleware/jwtAuth');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_v3';

router.get('/home', async (req, res) => {
  const { rows: factories } = await pool.query('SELECT id, name, district FROM factories;');
  res.json({ system: 'Aggregation Engine v3 Active', onlineFactories: factories });
});

router.post('/home/auth/signup', async (req, res) => {
  const { name, phone, password, district, role } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(`
      INSERT INTO users (name, phone, password_hash, district, role)
      VALUES ($1, $2, $3, $4, $5) RETURNING id, name, role;
    `, [name, phone, hash, district, role]);
    res.status(201).json({ success: true, user: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ error: 'This phone number is already registered for an account.' });
    } else {
      res.status(400).json({ error: 'Registration failed: ' + err.message });
    }
  }
});

router.post('/home/auth/login', async (req, res) => {
  const { phone, password } = req.body;
  const { rows } = await pool.query('SELECT * FROM users WHERE phone = $1;', [phone]);
  if (rows.length === 0) return res.status(401).json({ error: 'Invalid user parameters' });
  
  const user = rows[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json({ error: 'Invalid parameters' });

  let factoryId = null;
  let factoryIds = [];
  if (user.role === 'farmer') {
    const fProf = await pool.query('SELECT id FROM farmer_profile WHERE user_id = $1;', [user.id]);
    if (fProf.rows.length > 0) {
       const facs = await pool.query('SELECT factory_id FROM farmer_profile_factories WHERE farmer_id = $1;', [fProf.rows[0].id]);
       factoryIds = facs.rows.map(r => r.factory_id);
    }
  } else if (user.role === 'machine') {
    const mProf = await pool.query('SELECT factory_id FROM machine_profile WHERE user_id = $1;', [user.id]);
    if (mProf.rows.length > 0) factoryId = mProf.rows[0].factory_id;
  } else if (user.role === 'factory admin') {
    const fact = await pool.query('SELECT id FROM factories WHERE owner_user_id = $1;', [user.id]);
    if (fact.rows.length > 0) factoryId = fact.rows[0].id;
  }

  const jti = uuidv4();
  const userProfile = { id: user.id, name: user.name, phone: user.phone, district: user.district, role: user.role, factoryId, factoryIds };
  const token = jwt.sign({ ...userProfile, jti }, JWT_SECRET, { expiresIn: '7d' });
  
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', token, { 
    httpOnly: true, 
    secure: isProd, 
    sameSite: isProd ? 'none' : 'lax', 
    maxAge: 7 * 24 * 60 * 60 * 1000 
  });
  res.json({ success: true, role: user.role, factoryId, factoryIds, userProfile });
});

router.post('/home/feedback', async (req, res) => {
  const { name, phone, district, role, msg } = req.body;
  await pool.query('INSERT INTO enquiries (name, phone, district, role, msg) VALUES ($1, $2, $3, $4, $5);', [name, phone, district, role, msg]);
  res.json({ success: true });
});

router.get('/home/auth/me', jwtAuth, async (req, res) => {
  res.json({ 
    success: true, 
    role: req.user.role, 
    factoryId: req.user.factoryId,
    factoryIds: req.user.factoryIds,
    userProfile: {
      id: req.user.id,
      name: req.user.name,
      phone: req.user.phone,
      district: req.user.district,
      role: req.user.role,
      factoryId: req.user.factoryId,
      factoryIds: req.user.factoryIds
    }
  });
});

router.post('/home/auth/logout', async (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  });
  res.json({ success: true });
});

module.exports = router;