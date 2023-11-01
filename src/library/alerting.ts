import axios, { AxiosRequestConfig } from "axios";

export class Alerting {
  identifier: string;

  constructor(id: string) {
    this.identifier = id;
  }

  // how to mute an alert?
  async alert(db: any, redis: any, type: string) {
    let val = await redis.get(`${this.identifier}`)
    if (!val) {
      return
    }
    const parsed = JSON.parse(val)
    const last_alerted_at = parsed.last_alerted_at
    const current_ts = +new Date()
    const diff = current_ts - last_alerted_at

    if (last_alerted_at && ( diff / 1000 ) <= 300) {
      // NOTE: contacts were last alerted in less than 5 mins so wait a bit longer to notify again
      return
    }

    const rides = await db.select('rides', { id: this.identifier })
    if (!rides || !rides.length) {
      // throw some error?
      return
    }

    const ride = rides[0]

    const users = await db.select('users', { id: ride.user_id })
    if (!users || !users.length) {
      // throw some error?
      return
    }

    const user = users[0]

    const contacts = await db.select('contacts', { user_id: ride.user_id })
    if (!contacts || !contacts.length) {
      // throw some error?
      return
    }

    const reverseGeoCode = async (coords: number[]) => {
      const { data } = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords[0]},${coords[1]}&sensor=true&key=AIzaSyAzLWjo_sNFltV5E9uj8Oc1UlFq_0vT5wM`)
      const { results } = data

      const first = results[0]
      const addr = first.formatted_address

      return addr
    }

    const source = await reverseGeoCode(ride.source)
    const dest = await reverseGeoCode(ride.destination)
    
    // contacts.forEach(async contact => {
      const contact = contacts[0]
      let data = JSON.stringify({
        type,
        attributes: {
          "contactName": contact.firstname,
          "paxName": user.firstname,
          "source": source,
          "destination": dest
        }
      });

      let config = {
        method: 'put',
        maxBodyLength: Infinity,
        url: `http://localhost:3002/ride/${this.identifier}/alert`,
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
      } as AxiosRequestConfig;

      await axios.request(config)
      
      await redis.set(`${this.identifier}`, JSON.stringify({ ...parsed, last_alerted_at: current_ts }))
    // })
  }
}