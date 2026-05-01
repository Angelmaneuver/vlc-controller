import { Suspense, use, useState } from 'react';
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

function ErrorFallback({ error }: FallbackProps) {
  return (
    <div role="alert">
      <p>エラーが発生しました:</p>
      {error instanceof Error ? <pre style={{ color: 'red' }}>{error.message}</pre> : ''}
    </div>
  );
}

export default VlcController;
