import { invoke } from '@tauri-apps/api/core';

async function changeByComboBox(expand: boolean) {
  return invoke('change_by_combobox', { expand });
}

export default changeByComboBox;
