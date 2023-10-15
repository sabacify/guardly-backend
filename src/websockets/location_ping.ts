import { isNumber } from "util"

export const LocationPing = (server: any) => (connection: any, request: any) => {

  const { rideId } = request.params
  const { redis } = server as any
  
  // TODO: close connection if ride id is not valid
  connection.socket.send(`connected on ${rideId} room`)

  connection.socket.on('message', async (message) => {
    const coord = JSON.parse(message)
    if (coord.length !== 2 || !isNumber(coord[0]) || !isNumber(coord[1])) {
      connection.socket.send("invalid co-ordinates")
      return
    } else {
      const val = await redis.get(`${rideId}`)
      if (!val) {
        connection.socket.send("invalid ride id")
        return
      }
      const parsed = JSON.parse(val)
      if (!parsed) {
        connection.socket.send("invalid value retrieved from store")
        return
      }

      const updated = { ...parsed }
      if (parsed.hasOwnProperty("coords")) {
        updated["coords"].push(coord)
      } else {
        updated["coords"] = [coord]
      }

      await redis.set(`${rideId}`, JSON.stringify(updated))
      connection.socket.send(`co-ordinate ${message} saved`)
    }
  })
}