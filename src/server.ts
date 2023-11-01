import * as fastify from 'fastify'
import * as redis from '@fastify/redis';
import * as ws from '@fastify/websocket';
import * as multipart from '@fastify/multipart'
import { fastifySchedule } from '@fastify/schedule';
import { GetRideDetails, UpdateRideStatus, CreateRide, UpdateRidePhotos, Alert } from './apis';
import { registerWebSockets } from './websockets'
import { Database } from './library/database';

const server = fastify.default({
  logger: true,
  requestTimeout: 30000
})

server.register(fastifySchedule);

// server.register(redis.default, { url: 'redis://cache' }) // production
server.register(redis.default, { url: 'redis://127.0.0.1' }) // local

server.register(ws.default)

server.register(multipart.default)

server.register((_f, _opts, done) => {

  const db = new Database()
  db.init()
  
  registerWebSockets(server, db)
  
  server.get('/health', function (_r, reply) {
    reply.send({ success: true })
  })
  
  server.post('/ride', CreateRide(server, db))
  server.get('/ride/:rideId', GetRideDetails(server, db))
  server.put('/ride/:rideId/status/:status', UpdateRideStatus(server, db))
  server.put('/ride/:rideId/photos', UpdateRidePhotos(server))
  server.put('/ride/:rideId/alert', Alert(server, db))

  done()

})

server.listen({ port: 3002, host: '0.0.0.0' }, function (err) {
  if (err) {
    server.log.error(err)
    process.exit(1)
  }
})