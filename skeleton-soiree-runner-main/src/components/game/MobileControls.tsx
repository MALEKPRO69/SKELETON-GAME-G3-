import { useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowUp, Pause } from 'lucide-react';

interface MobileControlsProps {
  onInput: (direction: 'left' | 'right' | 'jump', pressed: boolean) => void;
  onPause: () => void;
}

export default function MobileControls({ onInput, onPause }: MobileControlsProps) {
  const handleTouchStart = useCallback((direction: 'left' | 'right' | 'jump') => {
    onInput(direction, true);
  }, [onInput]);

  const handleTouchEnd = useCallback((direction: 'left' | 'right' | 'jump') => {
    onInput(direction, false);
  }, [onInput]);

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-between items-end pointer-events-none z-50">
      {/* Left side controls */}
      <div className="flex gap-2 pointer-events-auto">
        <button
          onTouchStart={() => handleTouchStart('left')}
          onTouchEnd={() => handleTouchEnd('left')}
          onMouseDown={() => handleTouchStart('left')}
          onMouseUp={() => handleTouchEnd('left')}
          onMouseLeave={() => handleTouchEnd('left')}
          className="w-16 h-16 bg-primary/80 rounded-full flex items-center justify-center active:bg-primary active:scale-95 transition-all shadow-lg border-2 border-primary-foreground/30"
        >
          <ChevronLeft className="w-10 h-10 text-primary-foreground" />
        </button>
        <button
          onTouchStart={() => handleTouchStart('right')}
          onTouchEnd={() => handleTouchEnd('right')}
          onMouseDown={() => handleTouchStart('right')}
          onMouseUp={() => handleTouchEnd('right')}
          onMouseLeave={() => handleTouchEnd('right')}
          className="w-16 h-16 bg-primary/80 rounded-full flex items-center justify-center active:bg-primary active:scale-95 transition-all shadow-lg border-2 border-primary-foreground/30"
        >
          <ChevronRight className="w-10 h-10 text-primary-foreground" />
        </button>
      </div>

      {/* Center pause button */}
      <button
        onTouchStart={onPause}
        onClick={onPause}
        className="w-12 h-12 bg-muted/80 rounded-full flex items-center justify-center active:bg-muted active:scale-95 transition-all shadow-lg pointer-events-auto"
      >
        <Pause className="w-6 h-6 text-foreground" />
      </button>

      {/* Right side jump */}
      <button
        onTouchStart={() => handleTouchStart('jump')}
        onTouchEnd={() => handleTouchEnd('jump')}
        onMouseDown={() => handleTouchStart('jump')}
        onMouseUp={() => handleTouchEnd('jump')}
        onMouseLeave={() => handleTouchEnd('jump')}
        className="w-20 h-20 bg-secondary/80 rounded-full flex items-center justify-center active:bg-secondary active:scale-95 transition-all shadow-lg pointer-events-auto border-2 border-secondary-foreground/30"
      >
        <ArrowUp className="w-12 h-12 text-secondary-foreground" />
      </button>
    </div>
  );
}
