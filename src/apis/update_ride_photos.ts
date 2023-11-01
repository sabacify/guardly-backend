import { STATES } from "../library/statemachine"
import { FileStorage } from "../library/filestorage"

const UpdateRidePhotos = (server: any) => async (request: any, reply) => {
  const { rideId } = request.params as Record<string, string>
  const { filename, mimetype, file } = await request.file()

  const toBuffer = () => new Promise(resolve => {
    var bufs: any[] = [];

    file.on('data', function(d: any) { bufs.push(d); });
    file.on('end', function(){
      var buf = Buffer.concat(bufs);
      resolve(buf)
    })
  })

  const { redis } = server as any

  const val = await redis.get(`${rideId}`)
  if (!val) {
    reply.status(400).send({ message: "invalid ride id" })
    return
  }
  const parsed = JSON.parse(val)
  const currentState = parsed.status

  if (currentState === STATES.COMPLETED) {
    reply.status(500).send({ message: "invalid ride state" })
    return
  }

  const filestorage = new FileStorage(rideId)
  await filestorage.upload_file(filename, mimetype, await toBuffer())
  
  reply.send({ success: true })
}

export default UpdateRidePhotos;