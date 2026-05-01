import { request } from './abc';

async function volume(value: number): Promise<void> {
  return request('volume', { value });
}

export default volume;
