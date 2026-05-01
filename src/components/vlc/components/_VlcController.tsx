import { Suspense, use, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { Spinner } from '@/components/ui/spinner';

import { vlc } from '../function';
import { Data } from '../Interface';

import Controller from './_Controller';
import Window from './_Window';

function VlcController() {
  return (
    <ErrorBoundary>
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
    <Window initial={data} reload={reload}>
      <Controller channels={channels} status={status} reload={reload} />
    </Window>
  );
}

export default VlcController;
