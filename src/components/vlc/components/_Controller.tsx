import { Play, Square, Volume1, Volume2 } from 'lucide-react';
import { JSX } from 'react';

import { Button } from '@/components/ui/button';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { changeByComboBox } from '@/components/window';

import { select, stop, volume } from '../function';
import { Channel, Data } from '../Interface';

function Controller({
  className,
  channels,
  status,
  reload,
  ...props
}: JSX.IntrinsicElements['div'] & Data & { reload: () => Promise<void> }) {
  const current: Channel | null | undefined = channels.find((channel) => channel.current);

  return (
    <div className={`main ${className ?? ''}`.trim()} {...props}>
      <Combobox<Channel>
        items={channels}
        itemToStringLabel={(channel) => channel.name}
        defaultValue={current}
        onOpenChange={(open, _) => changeByComboBox(open)}
        onValueChange={async (value) => {
          if (value) {
            await select(value.id);
            reload();
          }
        }}
      >
        <ComboboxInput placeholder="チャンネルを選択してください..." />
        <ComboboxContent>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(channel: Channel) => {
              return (
                <ComboboxItem key={channel.id} value={channel}>
                  {channel.name}
                </ComboboxItem>
              );
            }}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      <Button
        className="button"
        disabled={status.state === 'stopped' && !current}
        onClick={
          status.state === 'playing'
            ? async () => {
                await stop();
                reload();
              }
            : async () => {
                await select(current!.id);
                reload();
              }
        }
      >
        {status.state === 'playing' ? <Play className="play" /> : <Square className="stop" />}
      </Button>

      <Button
        className="button"
        onClick={async () => {
          let value = status.volume + 10;
          if (value > 200) {
            value = 200;
          }

          await volume(value);
          reload();
        }}
      >
        <Volume2 />
      </Button>

      <Button
        className="button"
        onClick={async () => {
          let value = status.volume - 10;
          if (value < 0) {
            value = 0;
          }

          await volume(value);
          reload();
        }}
      >
        <Volume1 />
      </Button>
    </div>
  );
}

export default Controller;
