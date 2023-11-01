import { FileStorage } from "../library/filestorage"
import { STATES } from "../library/statemachine"

const GetRideDetails = (server: any, db: any) => async (request, reply) => {
  const { rideId } = request.params as Record<string, string>
  const { redis } = server

  let val = await redis.get(`${rideId}`)
  if (!val) {
    const rides = await db.select('rides', { id: rideId })
    const ride = rides[0]

    if (!ride) {
      reply.status(400).send({ message: "invalid ride id" })
      return
    }

    val = JSON.stringify({
      userId: ride.user_id,
      source: ride.source,
      destination: ride.destination,
      status: STATES.COMPLETED
    })
  }

  const filestorage = new FileStorage(rideId)
  const { files } = await filestorage.load_files()

  try {
    reply.send({ 
      success: true, 
      data: { 
        rideId, 
        files,
        ...(JSON.parse(val))
      } 
    })
  } catch (e) {
    reply.status(500).send({ message: "internal server error: something went wrong" })
  }
}

export default GetRideDetails