import { UserActions } from '../constants';
import sm from "../library/statemachine"

const UpdateRideStatus = (server: any) => async (request, reply) => {
  const { status = "", rideId } = request.params as Record<string, string>

  if (!Object.values(UserActions).includes(status.toLowerCase())) {
    reply.status(400).send({ message: "bad request: invalid action" })
    return
  }

  const { redis } = server as any

  const val = await redis.get(`${rideId}`)
  if (!val) {
    reply.status(400).send({ message: "invalid ride id" })
    return
  }

  const parsed = JSON.parse(val)
  const currentState = parsed.status
  const nextState = status

  if (currentState && currentState === nextState) {
    reply.status(201).send({ success: true })
    return
  }

  if(!sm[status] || sm.cannot(status)) {
    reply.status(400).send({ message: "invalid transition to next state" })
    return
  }
  
  sm[status]()
  await redis.set(`${rideId}`, JSON.stringify({ ...parsed, status: sm.state }))

  // TODO: copy the whole redis object to s3 folder by name of ride id
  // if (status === UserActions.COMPLETED) {
    //   // redis.delete(`${rideId}`)
  // }

  reply.send({ success: true})
}

export default UpdateRideStatus;