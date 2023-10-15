import { uuid } from 'uuidv4';
import sm from "../library/statemachine"

const CreateRide = (server: any) => async (request: any, reply) => {
  const rideId = uuid()

  const { redis } = server as any
  await redis.set(`${rideId}`, JSON.stringify({ status: sm.state }))
  
  reply.send({ success: true, data: { rideId, status: sm.state } })
}

export default CreateRide;
