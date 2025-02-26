type StartMessage = {
  type: 'start'
  now: Date
  duration: number
}

type PauseMessage = {
  type: 'pause'
  completed: number
}

type StopMessage = {
  type: 'stop'
}

type ResumeMessage = {
  type: 'resume'
}

type Message = StartMessage | PauseMessage | StopMessage | ResumeMessage
