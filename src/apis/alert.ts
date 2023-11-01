import axios, { AxiosRequestConfig } from 'axios';
import Handlebars from 'handlebars';

const service_plan_id = `4e2382df7bef42329ede66e56e2d8412`
const API_TOKEN = `eb0e999c04b44a8090e53f0acd35f112`

const Alert = (server: any, db: any) => async (request: any, reply) => {
  const { rideId } = request.params as Record<string, string>
  const { type, attributes } = request.body || {}

  // can check in redis if ride is valid
  
  let message = ''
  switch (type) {
    case 'LIVE_SIGNAL_LOST':
      message = 'URGENT !!!  Hi {{contactName}}, we are no longer able to track {{paxName}} on her journey from {{source}} to {{destination}}. Call her immediately to ensure her safety.'
      break
    case 'AUDIO_PANIC':
      message = 'URGENT !!! Hi {{contactName}}, we are sensing panic in voice of {{paxName}} during her cab from {{source}} to {{destination}}. Call her immediately to ensure her safety.'
      break
  }

  const template = Handlebars.compile(message)

  const rides = await db.select('rides', { id: rideId })
  if (!rides || !rides.length) {
    // throw some error?
    return
  }

  const ride = rides[0]

  const contacts = await db.select('contacts', { user_id: ride.user_id })
  if (!contacts || !contacts.length) {
    // throw some error?
    return
  }

  // TODO: to be sent to all contacts
  const contact = contacts[0]
  const toPhone = `+${contact.dial_code}${contact.phone}`

  const config = {
    method: 'post',
    url: `https://us.sms.api.sinch.com/xms/v1/${service_plan_id}/batches`,
    headers: { 
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + API_TOKEN
    },
    data: {
      from: `+447520651002`,
      to: [`+6598062813`], // [toPhone],
      body: template(attributes)
    }
  } as AxiosRequestConfig;

  const response = await axios.request(config)
  if (response.status >= 300) {
    console.warn({response})
    throw new Error(`failed to call sinch api :: ${response.statusText}`)
  }

  // read success response

  reply.send({ success: true })
}

export default Alert;