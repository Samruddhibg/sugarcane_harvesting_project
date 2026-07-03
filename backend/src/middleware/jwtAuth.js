const jwt = require('jsonwebtoken');
const IORedis = require('ioredis');
const redisConfig = require('../queue/connection');
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_v3';

// Dedicated Redis client for JWT blacklist lookups
const redisClient = new IORedis({ ...redisConfig, maxRetriesPerRequest: 3 });

async function jwtAuth(req, res, next) {
  let token = req.cookies && req.cookies.token;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Access token tracking missing' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // JWT Stateless Revocation Lookup via Redis JTI Blacklist
    if (decoded.jti) {
      const isBlacklisted = await redisClient.get('blacklist:' + decoded.jti);
      if (isBlacklisted) return res.status(401).json({ error: 'Token is revoked' });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid authentication context' });
  }
}

module.exports = jwtAuth;