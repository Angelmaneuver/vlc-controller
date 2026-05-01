import { Pin, PinOff, RotateCcw, X } from 'lucide-react';
import type { JSX } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { close } from '@/components/window';

function Window({
  className,
  children,
  reload,
  ...props
}: JSX.IntrinsicElements['section'] & {
  reload: () => Promise<void>;
}) {
  const [isPinned, setPin] = useState(true);

  return (
    <section className={`window ${className ?? ''}`.trim()} {...props}>
      {isPinned ? (
        children
      ) : (
        <div className="title" data-tauri-drag-region draggable="true">
          VLCコントローラー
        </div>
      )}

      <Button className="button" onClick={reload}>
        <RotateCcw />
      </Button>

      <Button className="button" onClick={() => setPin(!isPinned)}>
        {isPinned ? <Pin /> : <PinOff />}
      </Button>

      <Button className="button" onClick={close}>
        <X />
      </Button>
    </section>
  );
}

export default Window;
