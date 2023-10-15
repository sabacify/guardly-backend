const GetRideDetails = (server: any) => async (request, reply) => {
  const { rideId } = request.params as Record<string, string>
  const { redis } = server

  const val = await redis.get(`${rideId}`)
  if (!val) {
    reply.status(400).send({ message: "invalid ride id" })
    return
  }

  try {
    reply.send({ success: true, data: { rideId, ...(JSON.parse(val)) } })
  } catch (e) {
    reply.status(500).send({ message: "internal server error: something went wrong" })
  }
}

export default GetRideDetails