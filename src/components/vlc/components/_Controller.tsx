import { Play, Square, Volume, Volume1, Volume2, VolumeOff, VolumeX } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { changeByComboBox, changeByVolumeWindow } from '@/components/window';

import { select, stop, volume } from '../function';
import { Channel, Data } from '../Interface';

function Controller({
  className,
  channels,
  status,
  mute,
  reload,
  ...props
}: JSX.IntrinsicElements['div'] &
  Data & {
    mute: {
      isMute: boolean;
      volume: number;
      onPreMute: (volume: number) => void;
      onPreMuteCancel: () => void;
    };
    reload: () => Promise<void>;
  }) {
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
        {status.state === 'playing' ? <Square className="stop" /> : <Play className="play" />}
      </Button>

      <Popover onOpenChange={async (open) => changeByVolumeWindow(open)}>
        <PopoverTrigger asChild>
          <Button className="button">{getVolumeIcon(status.volume)}</Button>
        </PopoverTrigger>
        <PopoverContent className="volume">
          <Slider
            defaultValue={[status.volume]}
            max={300}
            step={1}
            onValueCommit={async (value) => {
              mute.onPreMuteCancel();
              await volume(value[0]);
              reload();
            }}
          />
        </PopoverContent>
      </Popover>

      <Button
        className="button"
        onClick={async () => {
          if (mute.isMute) {
            mute.onPreMuteCancel();
            await volume(mute.volume);
          } else {
            mute.onPreMute(status.volume);
            await volume(0);
          }

          reload();
        }}
        disabled={mute.isMute === false && status.volume === 0}
      >
        {mute.isMute ? getVolumeIcon(mute.volume) : <VolumeOff />}
      </Button>
    </div>
  );
}

function getVolumeIcon(value: number) {
  if (value === 0) {
    return <VolumeX />;
  } else if (value < 100) {
    return <Volume />;
  } else if (value < 150) {
    return <Volume1 />;
  } else {
    return <Volume2 />;
  }
}

export default Controller;
