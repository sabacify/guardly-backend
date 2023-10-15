import * as fastify from 'fastify'
import * as redis from '@fastify/redis';
import * as ws from '@fastify/websocket';
import { GetRideDetails, UpdateRideStatus, CreateRide, UpdateRideRoute } from './apis';
import { registerWebSockets } from './websockets'

const server = fastify.default({
  logger: true
})

server.register(redis.default, { url: 'redis://cache' })
server.register(ws.default)

server.register((_f, _opts, done) => {

  registerWebSockets(server)
  
  server.get('/health', function (_r, reply) {
    reply.send({ success: true })
  })
  
  server.post('/ride', CreateRide(server))
  server.get('/ride/:rideId', GetRideDetails(server))
  server.put('/ride/:rideId/status/:status', UpdateRideStatus(server))
  server.put('/ride/:rideId/route', UpdateRideRoute(server))

  done()

})

server.listen({ port: 3002, host: '0.0.0.0' }, function (err) {
  if (err) {
    server.log.error(err)
    process.exit(1)
  }
})