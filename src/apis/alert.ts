import axios, { AxiosRequestConfig } from 'axios';
import Handlebars from 'handlebars';

const channel_id = `c550996c-71af-4cd9-8c9b-816287457283`
const API_TOKEN = `VecKOkFcDvk09RUIGUkCblMmn8AALxHaz8r6`

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
  
  let data = JSON.stringify({
    "body": {
      "type": "text",
      "text": {
        "text": template(attributes)
      }
    },
    "receiver": {
      "contacts": [
        {
          "identifierValue": `+6593621920`, //`+${contact.dial_code}${contact.phone}`,
          "identifierKey": "phonenumber"
        }
      ]
    }
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://nest.messagebird.com/workspaces/d9cb4d50-131d-40a4-bdc4-4d5d8bff0769/channels/${channel_id}/messages`,
    headers: { 
      'Authorization': `AccessKey ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    data : data
  } as AxiosRequestConfig;

  console.log({ data, config })

  const response = await axios.request(config)
  if (response.status >= 300) {
    console.warn({response})
    throw new Error(`failed to call messagebird api :: ${response.statusText}`)
  }

  // read success response

  reply.send({ success: true })
}

export default Alert;