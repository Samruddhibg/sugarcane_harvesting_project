const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const IORedis = require('ioredis');
const redisConfig = require('../queue/connection');

let io;

function init(server) {
  io = new Server(server, {
    cors: { 
      origin: (origin, callback) => callback(null, true), 
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  try {
    const pubClient = new IORedis(redisConfig);
    const subClient = new IORedis(redisConfig);
    io.adapter(createAdapter(pubClient, subClient));
  } catch (err) {
    console.warn('Socket adapter disabled; continuing in-memory mode.', err.message);
  }

  io.on('connection', (socket) => {
    socket.on('join_room', (roomName) => {
      socket.join(roomName);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io cluster initialization missing!');
  return io;
}

module.exports = { init, getIO };