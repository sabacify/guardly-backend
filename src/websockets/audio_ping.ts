import * as fs from 'fs';
import * as ws from 'ws';
import { Alerting } from '../library/alerting';
import { FileStorage } from '../library/filestorage';

const negativeEmos = [
  "Anger",
  "Anxiety",
  "Awkwardness",
  "Distress",
  "Fear",
  "Horror",
  "Surprise (negative)"
]

export const AudioPing = (server: any, db: any) => (connection: any, request: any) => {
  const { rideId } = request.params
  const { redis } = server as any

  console.log("connected on audio socket")
  const connectHumeSocket = () => {
    return new ws.WebSocket(`wss://api.hume.ai/v0/stream/models`, {
      headers: {
        'X-Hume-Api-Key': 'siTjUGwFKkyo7FlzIoG9UYYx40AExtlWrfSLKxtRHhNU8DmP'
      }
    });
  }

  // let sock = connectHumeSocket()

  // let isReady = false
  // sock.on('open', function open() {
  //   isReady = true
  // });

  // sock.on('close', function() {
  //   console.log("socket is closing")
  //   isReady = false
  //   // setTimeout(() => {
  //   //   sock = connectHumeSocket()
  //   // }, 100)
  // });

  connection.socket.send(`connected on ${rideId} room`)

  connection.socket.on('message', async message => {
    console.log("audio pinged ...... ")
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

    const content = Buffer.from(message).toString()
    if (!content) {
      connection.socket.send('no content')
      return
    }
    const parsedContent = JSON.parse(content)

    const seq = parsedContent.packet
    const blob = parsedContent.blob
    const isLast = parsedContent.isLast

    console.log(`audio pinged for sequence :: `, seq)

    // const buff = Buffer.from(
    //   blob.split('base64,')[1],  // only use encoded data after "base64,"
    //   'base64'
    // )
    // fs.writeFileSync(`${rideId}-#${seq}.mp4`, buff);

    // const fs = new FileStorage(rideId)
    // await fs.upload_audio_files(`${rideId}-#${seq}.mp4`, `audio/mp4`, buff)

    // if (isReady) {
      const data = {
        models: {
          prosody: {}
        },
        raw_text: false,
        data: blob.split('base64,')[1]
      }

      console.log("hume request", seq)
      const _socket = connectHumeSocket()
      
      _socket.on('open', () => {
        _socket.send(JSON.stringify(data))
      })

      _socket.on('message', async (response) => {
        console.log("hume response", seq)
        const res = JSON.parse(response.toString())
        console.log({res})
        if (!res || !res.prosody || !res.prosody.predictions) {
          return
        }

        const preds = res.prosody.predictions;
        
        const risky = preds.some(pred => {
          console.log({pred})
          const emos = pred.emotions
          const emoScore = emos.reduce((acc, curr) => {
            const nm = curr.name
            const vl = curr.score

            if (!negativeEmos.includes(nm)) {
              return acc
            }
            if (vl > 0.1) {
              console.log("emotion strong ---- ", {nm, vl})
              return acc + vl
            }
            return acc
          }, 0)

          console.log({emoScore})
          return emoScore > 1.5
        })

        console.log("is her voice risky? ", risky) // send alert? to implement api?
        if (risky) {
          const alerting = new Alerting(rideId)
          await alerting.alert(db, redis, 'AUDIO_PANIC')
        }
        _socket.close()
        connection.socket.send(`ok`)
      })
    // }
  })
}