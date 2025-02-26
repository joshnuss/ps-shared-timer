<script lang="ts">
  import PartySocket from 'partysocket'
  import { onMount } from 'svelte'
  import * as devalue from 'devalue'

  const INTERVAL = 200
  const ws = new PartySocket({
    host: window.location.host,
    room: 'room1',
    party: 'my-server',
  })

  type Status = 'stopped' | 'running' | 'paused'

  let status = $state<Status>('stopped')
  let startAt = $state(new Date())
  let duration = $state(0)
  let completed = $state(0)
  let interval: number | undefined

  onMount(() => {
    ws.addEventListener('message', onMessage)
  })

  function onMessage(event: MessageEvent) {
    const message = devalue.parse(event.data) as Message

    switch(message.type) {
      case 'start':
        status = 'running'
        startAt = message.now
        duration = message.duration
        interval = setInterval(onInterval, INTERVAL)
        break

      case 'pause':
        status = 'paused'
        clearInterval(interval)
        break

      case 'resume':
        status = 'running'
        interval = setInterval(onInterval, INTERVAL)
        break

      case 'stop':
        status = 'stopped'
        completed = 0
        duration = 0
        clearInterval(interval)
        break
    }
  }

  function onInterval() {
    completed = Date.now() - startAt.getTime()

    if (completed/1000 >= duration) {
      status = 'stopped'
      completed = duration * 1000
      clearInterval(interval)
    }
  }

  function start() {
    duration = 10
    send({ type: 'start', now: new Date(), duration })
  }

  function pause() {
    send({ type: 'pause', completed: 0 })
  }

  function stop() {
    send({ type: 'stop' })
  }

  function resume() {
    send({ type: 'resume' })
  }

  function send(message: Message) {
    const payload = devalue.stringify(message)

    ws.send(payload)
  }
</script>

<main>
  <h1>
    {#if status == 'stopped'}
      10
    {:else}
      {(completed/1000).toFixed(0)}
    {/if}
  </h1>
  <p>{status}</p>

  {#if status == 'stopped'}
    <button onclick={start}>Start</button>
  {:else if status == 'running'}
    <button onclick={pause}>Pause</button>
    <button onclick={stop}>Stop</button>
  {:else if status == 'paused'}
    <button onclick={resume}>Resume</button>
  {/if}
</main>

<style>
</style>
