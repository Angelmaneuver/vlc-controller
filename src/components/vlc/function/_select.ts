import { request } from './abc';

async function select(id: string): Promise<void> {
  return request('select', { id });
}

export default select;
