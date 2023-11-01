import { uuid } from 'uuidv4';
import { STATES } from "../library/statemachine"
import { Database } from '../library/database';

const CreateRide = (server: any, db: Database) => async (request: any, reply) => {
  const rideId = uuid()

  const { redis } = server as any
  const { source, destination } = request.body || {}
  
  const headers = request.headers;
  const userId = headers['x-user-id']

  if (!userId) {
    console.log({headers})
    reply.status(400).send({ message: "bad request: missing header for user id" })
    return
  }

  // todo: validate if userId is valid in database

  if (!source || !destination) {
    reply.status(400).send({ message: "bad request: source or destination empty" })
    return
  }

  db.insert('rides', {
    id: rideId,
    source,
    destination,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: userId
  })
  
  const toCache = { status: STATES.IDLE, ts: +new Date(), source, destination, userId }
  await redis.set(`${rideId}`, JSON.stringify(toCache))
  
  reply.send({ success: true, data: { rideId, ...toCache } })
}

export default CreateRide;
