import { get } from "./abc";

import type { Channel } from "../Interface";

async function channel(): Promise<Array<Channel>> {
  const [data, error] = await get<Array<Channel>>("channel");

  if (error) {
    throw new Error(error);
  }

  return data;
}

export default channel;
