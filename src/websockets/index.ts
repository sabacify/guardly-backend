import { LocationPing } from "./location_ping.js"
import { AudioPing } from "./audio_ping.js"
import { LivePing } from "./live_ping.js"

export const registerWebSockets = (server: any, db: any) => {

  server.get('/ride/:rideId/location/ping', { websocket: true, schema: null } as any, LocationPing(server))

  server.get('/ride/:rideId/audio/ping', { websocket: true, schema: null } as any, AudioPing(server, db))

  server.get('/ride/:rideId/live/ping', { websocket: true, schema: null } as any, LivePing(server))

}