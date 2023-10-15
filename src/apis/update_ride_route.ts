import sm, { STATES } from "../library/statemachine"

const UpdateRideRoute = (server: any) => async (request: any, reply) => {
  const { rideId } = request.params as Record<string, string>
  const { source, destination } = request.body || {}

  if (!source || !destination) {
    reply.status(400).send({ message: "bad request: source or destination empty" })
    return
  }

  const { redis } = server as any

  const val = await redis.get(`${rideId}`)
  if (!val) {
    reply.status(400).send({ message: "invalid ride id" })
    return
  }

  if (sm.state === STATES.COMPLETED) {
    reply.status(500).send({ message: "invalid ride state" })
    return
  }

  const parsed = JSON.parse(val)
  await redis.set(`${rideId}`, JSON.stringify({ ...parsed, source, destination }))
  
  reply.send({ success: true, data: { ...parsed, source, destination } })
}

export default UpdateRideRoute;