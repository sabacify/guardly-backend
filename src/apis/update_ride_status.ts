import { UserActions } from '../constants';
import { STATES } from '../library/statemachine';
import { FileStorage } from '../library/filestorage';
import { Alerting } from '../library/alerting';
import { SimpleIntervalJob, Task } from 'toad-scheduler';

const UpdateRideStatus = (server: any, db: any) => async (request, reply) => {
  const { status = "", rideId } = request.params as Record<string, string>
  const { code = "" } = request.body || {}

  const headers = request.headers;
  const userId = headers['x-user-id']

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

  if (currentState === STATES.COMPLETED) {
    reply.status(400).send({ message: "invalid ride state for update" })
    return
  }
  
  let nextState = ''
  switch (status) {
    case UserActions.START:
      nextState = STATES.IN_TRANSIT;
      break;
    case UserActions.END:
      nextState = STATES.COMPLETED;
      break;
    case UserActions.MARK_SAFE:
      nextState = STATES.IN_TRANSIT;
      break;
    default:
      nextState = STATES.IDLE
      break;
  }

  if (status === UserActions.MARK_SAFE) {
    server.scheduler.stopById(`${rideId}_liveness`)
    reply.status(201).send({ message: "no change in state, marked safe" })
    return
  }

  if (currentState === nextState) {
    reply.status(201).send({ message: "no change in state" })
    return
  }

  const toCache = { ...parsed, status: nextState }

  if (nextState === STATES.COMPLETED) {
    const users = await db.select('users', { id: userId })
    const user = users[0]
    
    // if (code !== user.code) {
    //   reply.status(400).send({ message: "invalid code" })
    //   return
    // }

    const fs = new FileStorage(rideId)
    await fs.upload_log(`debug.log`, `text/plain`, new TextEncoder().encode(JSON.stringify({ rideId, ...toCache })), `completed`)

    redis.del(`${rideId}`)
    reply.send({ success: true})
    return
  }

  const task = new Task(`${rideId}-liveness`, async () => {
    let val = await redis.get(`${rideId}`)
    if (!val) {
      console.log("invalid ride id")
      server.scheduler.stopById(`${rideId}_liveness`)
      return
    }

    const parsed = JSON.parse(val)
    const { ts } = parsed
    const currentTs = +new Date()
    const diff = currentTs - ts

    if (Math.ceil(diff / 1000) > 30) { // Pax not reachable in last 30 seconds
      const alerting = new Alerting(rideId)
      await alerting.alert(db, redis, 'LIVE_SIGNAL_LOST')
    } else {
      console.log("all ok!", diff / 1000)
    }
  })

  const job = new SimpleIntervalJob(
    { milliseconds: 30000 },
    task,
    { id: `${rideId}_liveness` }
  )

  if (nextState === STATES.IN_TRANSIT && status !== UserActions.MARK_SAFE) {
    server.scheduler.addSimpleIntervalJob(job)
  } else if (nextState === STATES.COMPLETED) {
    server.scheduler.stopById(`${rideId}_liveness`)
  }
  
  await redis.set(`${rideId}`, JSON.stringify(toCache))
  reply.send({ success: true})
}

export default UpdateRideStatus;