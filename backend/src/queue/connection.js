require('dotenv').config();

let redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null
};

if (process.env.REDIS_URL) {
  const parsed = new URL(process.env.REDIS_URL);
  redisConfig = {
    host: parsed.hostname,
    port: parseInt(parsed.port || '6379'),
    username: parsed.username || 'default',
    password: parsed.password,
    tls: parsed.protocol === 'rediss:' ? {} : undefined,
    maxRetriesPerRequest: null
  };
}

module.exports = redisConfig;