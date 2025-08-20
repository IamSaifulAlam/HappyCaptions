
"use client";

import React from 'react';
import { cn } from "@/lib/utils";

export type TourPopoverProps = {
  id: number;
  elementId: string;
  text: string;
  pos: 'top' | 'bottom' | 'left' | 'right';
  align: 'start' | 'center' | 'end';
  isOpen: boolean;
  targetRect?: DOMRect;
};

export default function TourPopover({ text, isOpen, targetRect, pos, align }: TourPopoverProps) {
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const [style, setStyle] = React.useState<React.CSSProperties>({});

  React.useEffect(() => {
    if (!isOpen || !targetRect || !popoverRef.current) return;

    const popoverRect = popoverRef.current.getBoundingClientRect();
    const gap = 12;
    let newStyle: React.CSSProperties = { opacity: 1, visibility: 'visible' };

    // Horizontal positioning
    if (pos === 'top' || pos === 'bottom') {
      if (align === 'start') {
        newStyle.left = targetRect.left;
      } else if (align === 'center') {
        newStyle.left = targetRect.left + targetRect.width / 2 - popoverRect.width / 2;
      } else if (align === 'end') {
        newStyle.left = targetRect.right - popoverRect.width;
      }
    }

    // Vertical positioning
    if (pos === 'left' || pos === 'right') {
      if (align === 'start') {
        newStyle.top = targetRect.top;
      } else if (align === 'center') {
        newStyle.top = targetRect.top + targetRect.height / 2 - popoverRect.height / 2;
      } else if (align === 'end') {
        newStyle.top = targetRect.bottom - popoverRect.height;
      }
    }

    // Main position based on 'pos'
    if (pos === 'top') {
      newStyle.top = targetRect.top - popoverRect.height - gap;
    } else if (pos === 'bottom') {
      newStyle.top = targetRect.bottom + gap;
    } else if (pos === 'left') {
      newStyle.left = targetRect.left - popoverRect.width - gap;
    } else if (pos === 'right') {
      newStyle.left = targetRect.right + gap;
    }

    // Boundary checks to prevent going off-screen
    if (newStyle.left && (newStyle.left as number) < gap) {
      newStyle.left = gap;
    }
    if (newStyle.top && (newStyle.top as number) < gap) {
      newStyle.top = gap;
    }
    if (newStyle.left && newStyle.left as number + popoverRect.width > window.innerWidth - gap) {
        newStyle.left = window.innerWidth - popoverRect.width - gap;
    }
    if (newStyle.top && newStyle.top as number + popoverRect.height > window.innerHeight - gap) {
        newStyle.top = window.innerHeight - popoverRect.height - gap;
    }


    setStyle(newStyle);

  }, [isOpen, targetRect, pos, align]);


  return (
    <div
      ref={popoverRef}
      data-tour-popover
      className={cn(
        "fixed z-[101] text-sm max-w-xs p-4 rounded-md border bg-popover text-popover-foreground shadow-md transition-all duration-300 ease-in-out",
        !isOpen || !targetRect ? "opacity-0 invisible" : "opacity-100 visible"
      )}
      style={style}
    >
      {text}
    </div>
  );
}
