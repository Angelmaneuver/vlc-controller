import type { Channel } from '../Interface';

import { get } from './abc';

async function channel(): Promise<Array<Channel>> {
  const [data, error] = await get<Array<Channel>>('channel');

  if (typeof error === 'string') {
    throw new Error(error);
  }

  return data;
}

export default channel;
