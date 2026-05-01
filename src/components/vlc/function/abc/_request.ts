import type { InvokeArgs } from '@tauri-apps/api/core';
import { invoke } from '@tauri-apps/api/core';

async function request(cmd: string, args: InvokeArgs | undefined): Promise<void> {
  const data = await invoke<string>(cmd, args);

  if (typeof data === 'string') {
    throw new Error(data);
  } else {
    return;
  }
}

export default request;
