import { CSSProperties, Suspense, use, useState } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { ErrorBoundary } from 'react-error-boundary';

import { Spinner } from '@/components/ui/spinner';

import { vlc } from '../function';
import { Data } from '../Interface';

import Controller from './_Controller';
import Window from './_Window';

function VlcController() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense
        fallback={
          <div className="loading">
            <Spinner />
          </div>
        }
      >
        <Wrapper initial={vlc()} />
      </Suspense>
    </ErrorBoundary>
  );
}

function Wrapper({ initial }: { initial: Promise<Data> }) {
  const data = use(initial);

  const [channels, setChannels] = useState(data.channels);
  const [status, setStatus] = useState(data.status);

  async function reload() {
    const data = await vlc();
    setChannels(data.channels);
    setStatus(data.status);
  }

  return (
    <Window reload={reload}>
      <Controller channels={channels} status={status} reload={reload} />
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
