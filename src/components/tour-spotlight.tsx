
"use client";

import React, { useState, useEffect, type RefObject } from 'react';
import TourPopover, { type TourPopoverProps } from './tour-popover';

type TourSpotlightProps = {
  tourStepConfig: Omit<TourPopoverProps, 'isOpen' | 'targetRect'> | null;
  children?: React.ReactNode;
  scrollableContainerRef: RefObject<HTMLElement>;
};

export default function TourSpotlight({ tourStepConfig, scrollableContainerRef }: TourSpotlightProps) {
  const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({});
  const [targetRect, setTargetRect] = useState<DOMRect | undefined>(undefined);
  
  useEffect(() => {
    const updateSpotlight = () => {
      if (!tourStepConfig) {
         setSpotlightStyle({
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
          transition: 'all 0.3s ease-in-out',
          opacity: 1,
          pointerEvents: 'none',
        });
        setTargetRect(undefined);
        return;
      };

      const element = document.getElementById(tourStepConfig.elementId);
      
      if (element) {
        const scrollableParent = element.closest('[data-tour-scroll-container]');
        
        const positionAndUpdate = () => {
          const rect = element.getBoundingClientRect();
          const padding = 10;
          const borderRadius = 8;

          setSpotlightStyle({
            position: 'fixed',
            left: `${rect.left - padding}px`,
            top: `${rect.top - padding}px`,
            width: `${rect.width + padding * 2}px`,
            height: `${rect.height + padding * 2}px`,
            borderRadius: `${borderRadius}px`,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
            transition: 'all 0.3s ease-in-out',
            pointerEvents: 'none',
          });
          setTargetRect(rect);
        }
        
        const isOutOfView = (el: HTMLElement, container: HTMLElement) => {
            const elRect = el.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            return (
                elRect.bottom > containerRect.bottom ||
                elRect.top < containerRect.top
            );
        };

        if (scrollableParent && isOutOfView(element, scrollableParent as HTMLElement)) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          const timer = setTimeout(positionAndUpdate, 300);
          return () => clearTimeout(timer);
        } else {
          positionAndUpdate();
        }

      } else {
        setSpotlightStyle({
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
          transition: 'all 0.3s ease-in-out',
          opacity: 1,
          pointerEvents: 'none',
        });
        setTargetRect(undefined);
      }
    };
    
    updateSpotlight();
    
    const mainScrollEl = scrollableContainerRef.current;
    const cardScrollEls = document.querySelectorAll('[data-tour-scroll-container]');

    window.addEventListener('resize', updateSpotlight);
    window.addEventListener('scroll', updateSpotlight, true); // Use capture to get scroll events early
    mainScrollEl?.addEventListener('scroll', updateSpotlight);
    cardScrollEls.forEach(el => el.addEventListener('scroll', updateSpotlight));

    return () => {
        window.removeEventListener('resize', updateSpotlight);
        window.removeEventListener('scroll', updateSpotlight, true);
        mainScrollEl?.removeEventListener('scroll', updateSpotlight);
        cardScrollEls.forEach(el => el.removeEventListener('scroll', updateSpotlight));
    };
    
  }, [tourStepConfig, scrollableContainerRef]);

  return (
    <>
      <div style={spotlightStyle} data-tour-spotlight-element />
      {tourStepConfig && (
        <TourPopover
            {...tourStepConfig}
            isOpen={!!targetRect}
            targetRect={targetRect}
        />
      )}
    </>
  );
}
