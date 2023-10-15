export const AudioPing = (server: any) => (connection: any, request: any) => {
  const { rideId } = request.params
  connection.socket.send(`connected on ${rideId} room`)
}