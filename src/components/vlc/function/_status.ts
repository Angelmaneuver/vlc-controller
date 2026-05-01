import type { Status } from '../Interface';

import { get } from './abc';

async function status(): Promise<Status> {
  const [data, error] = await get<Status>('status');

  if (error) {
    throw new Error(error);
  }

  return data;
}

export default status;
