import type { Data } from '../Interface';

import channel from './_channel';
import status from './_status';

async function vlc(): Promise<Data> {
  const channelData = await channel();
  const statusData = await status();

  return { channels: channelData, status: statusData };
}

export default vlc;
