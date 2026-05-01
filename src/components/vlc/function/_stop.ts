import { request } from './abc';

async function stop(): Promise<void> {
  return request('stop');
}

export default stop;
