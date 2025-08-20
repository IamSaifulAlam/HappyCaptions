
import * as React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  resizable?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, resizable, ...props }, ref) => {
    const [height, setHeight] = React.useState<number | undefined>(
      props.rows ? props.rows * 20 : 80
    );
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useImperativeHandle(ref, () => textareaRef.current!);

    const handleMouseDown = (
      e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
    ) => {
      const startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const startHeight = textareaRef.current?.clientHeight ?? 0;

      const doDrag = (moveEvent: MouseEvent | TouchEvent) => {
        const currentY =
          'touches' in moveEvent
            ? moveEvent.touches[0].clientY
            : moveEvent.clientY;
        const newHeight = startHeight + currentY - startY;
        setHeight(newHeight);
      };

      const stopDrag = () => {
        window.removeEventListener('mousemove', doDrag);
        window.removeEventListener('mouseup', stopDrag);
        window.removeEventListener('touchmove', doDrag);
        window.removeEventListener('touchend', stopDrag);
      };

      window.addEventListener('mousemove', doDrag);
      window.addEventListener('mouseup', stopDrag);
      window.addEventListener('touchmove', doDrag);
      window.addEventListener('touchend', stopDrag);
    };

    if (resizable) {
      return (
        <div className="relative w-full">
          <TextareaAutosize
            className={cn(
              'flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              'resize-none',
              className
            )}
            ref={textareaRef}
            style={{ height: height ? `${height}px` : 'auto' }}
            {...props}
          />
          <div
            className="absolute bottom-[-4px] right-[-4px] cursor-se-resize p-2 text-muted-foreground/50 hover:text-muted-foreground"
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 8 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 1v1c0 2.75-2.25 5-5 5h-1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      );
    }
    return (
      <TextareaAutosize
        className={cn(
          'flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
