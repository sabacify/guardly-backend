export const LivePing = (server: any) => (connection: any, request: any) => {

  const { rideId } = request.params
  const { redis } = server as any
  
  // TODO: close connection if ride id is not valid
  connection.socket.send(`connected on ${rideId} room`)

  connection.socket.on('message', async () => {
    let val = await redis.get(`${rideId}`)
    if (!val) {
      connection.socket.send(`invalid ride id`)
      return
    }

    const parsed = JSON.parse(val)
    await redis.set(`${rideId}`, JSON.stringify({
      ...parsed,
      ts: +new Date()
    }))

    console.log('live pinged')
    connection.socket.send(`healthy`)
  })
}