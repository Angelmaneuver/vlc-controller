interface Data {
  channels: Array<Channel>;
  status: Status;
}

interface Channel {
  id: string;
  name: string;
  current: boolean;
  duration: string;
  uri: string;
}

interface Status {
  volume: number;
  state: (typeof State)[keyof typeof State];
}

const State = {
  PLAYING: 'playing',
  STOPPED: 'stopped',
} as const;

export { State };
export type { Channel, Data, Status };
