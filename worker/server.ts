import { Server, type Connection, routePartykitRequest } from "partyserver"
import * as devalue from 'devalue'

type Env = {
  MyServer: DurableObjectNamespace<MyServer>
}

export class MyServer extends Server<Env> {
  async onMessage(conn: Connection, payload: string) {
    const message = devalue.parse(payload) as Message

    switch (message.type) {
      case 'start':
        await this.ctx.storage.put('start', message.now)
        await this.ctx.storage.setAlarm(message.now.getTime() + (message.duration*1000))
        break

      case 'stop':
        await this.ctx.storage.deleteAll()
        await this.ctx.storage.deleteAlarm()
        break
    }

    this.broadcast(devalue.stringify(message))
  }

  async onAlarm() {
    const stop: StopMessage = { type: 'stop' }

    this.broadcast(devalue.stringify(stop))
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return (
      (await routePartykitRequest(request, env)) ||
      new Response("Not found", {
        status: 404,
      })
    )
  },
} satisfies ExportedHandler<Env>
