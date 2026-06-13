import { invoke } from '@tauri-apps/api/core';

async function changeByVolumeWindow(expand: boolean) {
  return invoke('change_by_volume_window', { expand });
}

export default changeByVolumeWindow;
