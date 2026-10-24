import { CSSProperties, Suspense, use, useState } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { ErrorBoundary } from 'react-error-boundary';

import { Spinner } from '@/components/ui/spinner';

import { vlc } from '../function';
import { Data } from '../Interface';

import Controller from './_Controller';
import Window from './_Window';

function VlcController() {
  const [initial, setInitial] = useState(vlc());

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => setInitial(vlc())}>
      <Suspense
        fallback={
          <div className="loading">
            <Spinner />
          </div>
        }
      >
        <Wrapper initial={initial} />
      </Suspense>
    </ErrorBoundary>
  );
}

function Wrapper({ initial }: { initial: Promise<Data> }) {
  const data = use(initial);

  const [key, setKey] = useState(getKey());
  const [channels, setChannels] = useState(data.channels);
  const [status, setStatus] = useState(data.status);
  const [isMute, setIsMute] = useState(false);
  const [volume, setVolume] = useState(data.status.volume);

  function getKey(): string {
    return new Date().toISOString();
  }

  function onPreMute(volume: number) {
    setIsMute(true);
    setVolume(volume);
  }

  function onPreMuteCancel() {
    setIsMute(false);
  }

  async function reload() {
    const data = await vlc();
    setKey(getKey());
    setChannels(data.channels);
    setStatus(data.status);
  }

  return (
    <Window reload={reload}>
      <Controller
        key={key}
        channels={channels}
        status={status}
        mute={{
          isMute: isMute,
          volume: volume,
          onPreMute: onPreMute,
          onPreMuteCancel: onPreMuteCancel,
        }}
        reload={reload}
      />
    </Window>
  );
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <Window
      reload={async () => {
        resetErrorBoundary();
      }}
    >
      <div className="main">
        <LED style={{ width: '28.9em' }} text={`エラーが発生しました:${toString(error)}`} />
      </div>
    </Window>
  );
}

function toString(error: unknown): string {
  if (typeof error === 'string') {
    return (error as string).trim();
  } else if (error instanceof Error) {
    return error.message;
  } else {
    return '不明なエラー';
  }
}

function LED({
  className = '',
  style = undefined,
  marquee = true,
  text = '',
}: {
  className?: string;
  style?: CSSProperties;
  marquee?: boolean;
  text?: string;
}) {
  return (
    <div className={`led ${marquee ? 'marquee' : ''} ${className || ''}`.trim()} style={style}>
      {text.length > 0 ? (
        <span style={marquee ? { animationDuration: `${text.length}s` } : undefined}>{text}</span>
      ) : (
        ''
      )}
    </div>
  );
}

LED.defaultProps = {
  className: '',
  style: undefined,
  marquee: true,
  text: '',
};

export default VlcController;
