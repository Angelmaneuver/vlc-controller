import { invoke } from '@tauri-apps/api/core';

import type { Data } from '../Interface';

import channel from './_channel';
import status from './_status';

async function vlc(): Promise<Data> {
  const channelData = await channel();
  const statusData = await status();

  await invoke('reset_window');

  return { channels: channelData, status: statusData };
}

export default vlc;
