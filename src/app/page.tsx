
"use client";

import React, { useRef, useContext, useState, useEffect } from 'react';
import type { PopoverContentProps } from "@radix-ui/react-popover";
import FloatingShapes from "@/components/floating-shapes";
import HappyCaptionsUI from "@/components/happy-captions-ui";
import Header from "@/components/header";
import { ThemeContext } from '@/context/theme-context';
import { Button } from '@/components/ui/button';
import TourSpotlight from '@/components/tour-spotlight';
import type { TourPopoverProps } from '@/components/tour-popover';
import { X } from 'lucide-react';

const tourSteps: Array<Omit<TourPopoverProps, 'isOpen'>> = [
  { id: 1, elementId: 'tour-step-1', text: "Select the type of post you want to create, like a sale announcement or a personal story.", pos: 'top', align: 'center' },
  { id: 2, elementId: 'tour-step-2', text: "Enter your brand or profile name here so the AI can incorporate it into the captions.", pos: 'top', align: 'center' },
  { id: 3, elementId: 'tour-step-3', text: "Click here to clear all the form fields and uploaded images.", pos: 'left', align: 'center' },
  { id: 4, elementId: 'tour-step-4', text: "Choose how many different caption options you want the AI to generate.",  pos: 'top', align: 'center' },
  { id: 5, elementId: 'tour-step-5', text: "Select the language for your generated captions and hashtags.",  pos: 'top', align: 'center' },
  { id: 6, elementId: 'tour-step-6', text: "Click the '+' to upload up to 3 images from your device, or paste an image from your clipboard using the button on the right.", pos: 'top', align: 'center' },
  { id: 7, elementId: 'tour-step-7', text: "Choose the tone of voice for your captions, like 'Witty' or 'Professional'.", pos: 'top', align: 'center' },
  { id: 8, elementId: 'tour-step-8', text: "Tell the AI about your page or brand. The more context you provide, the better the results!", pos: 'top', align: 'center' },
  { id: 9, elementId: 'tour-step-9', text: "Provide specific details about this particular post. What's the story behind the image?", pos: 'top', align: 'center' },
  { id: 10, elementId: 'tour-step-10', text: "Once you've filled everything out, click here to let the AI work its magic!", pos: 'top', align: 'center' },
  { id: 11, elementId: 'tour-step-11', text: "Your generated captions and hashtags will appear here. You can copy, share, or edit them.", pos: 'left', align: 'start' },
  { id: 12, elementId: 'tour-step-12', text: "Access your previously generated posts here. You can load or delete them.", pos: 'left', align: 'center' },
];

const TOTAL_TOUR_STEPS = tourSteps.length;

export default function Home() {
  const mainRef = useRef<HTMLElement>(null);
  const themeContext = useContext(ThemeContext);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const currentTourStep = isTourOpen ? tourSteps[tourStep - 1] : null;

  const handleScrollToTop = () => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  useEffect(() => {
    if (isTourOpen) {
      setTourStep(1);
    } else {
      setTourStep(0);
    }
  }, [isTourOpen]);

  const handleTourNext = () => {
    if (tourStep < TOTAL_TOUR_STEPS) {
      setTourStep(prev => prev + 1);
    } else {
      setIsTourOpen(false);
    }
  };

  const handleTourClick = (e: React.MouseEvent<HTMLDivElement>) => {
    handleTourNext();
  };

  if (!themeContext?.isThemeLoaded) {
    return null; // The loading animation is now in RootLayout
  }

  return (
    <div className="relative flex flex-col w-full lg:h-screen lg:overflow-hidden bg-background">
      <FloatingShapes onScrollToTop={handleScrollToTop} scrollableRef={mainRef} />
      <Header setIsTourOpen={setIsTourOpen} />
      <main 
        ref={mainRef} 
        className="flex-grow z-10 p-12 pt-20 md:px-24 md:pt-20 md:pb-12 lg:py-8 lg:px-12 flex lg:items-center overflow-y-auto custom-scrollbar lg:overflow-hidden"
      >
        <HappyCaptionsUI />
      </main>
      {isTourOpen && (
        <div
          className="fixed inset-0 z-[100] animate-in fade-in-0"
          onClick={handleTourClick}
        >
          <TourSpotlight
            tourStepConfig={currentTourStep}
            scrollableContainerRef={mainRef}
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
                e.stopPropagation();
                setIsTourOpen(false)
            }}
            className="rounded-full text-white/80 hover:bg-white/20 hover:text-white fixed top-4 right-4 z-[102]"
            aria-label="Close tour"
          >
            <X className="h-6 w-6" />
          </Button>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[102]">
            <Button onClick={handleTourNext} size="lg">
              {tourStep < TOTAL_TOUR_STEPS ? `Next (${tourStep}/${TOTAL_TOUR_STEPS})` : "Got it, close the tour"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
