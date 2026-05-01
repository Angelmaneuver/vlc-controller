import { invoke } from "@tauri-apps/api/core";

async function get<T>(cmd: string): Promise<[T, undefined] | [undefined, string]> {
  const data = await invoke<T | string>(cmd);

  if (typeof data === "string") {
    return [undefined, data];
  } else {
    return [data, undefined];
  }
}

export default get;
