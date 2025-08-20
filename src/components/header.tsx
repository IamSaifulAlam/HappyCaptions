
"use client";

import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { cn } from "@/lib/utils";
import patterns from "@/app/pattern.json";
import ThemeToggleButton from "@/components/theme-toggle-button";
import { Button } from "./ui/button";

type HeaderProps = {
  setIsTourOpen: Dispatch<SetStateAction<boolean>>;
};

export default function Header({ setIsTourOpen }: HeaderProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  const mainFlower = patterns.patterns.find(p => p.name === "mainFlower");
  const headerHeight = 64; // Corresponds to h-16
  const translateY = Math.min(scrollY / 2, headerHeight);

  return (
    <header 
      id="main-header"
      className={cn(
        "fixed top-0 z-20 w-full bg-transparent transition-transform duration-100 ease-out"
      )}
      style={{
        transform: `translateY(-${translateY}px)`
      }}
    >
      <div className="w-full h-16 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-screen-xl flex items-center justify-between">
          <a href="/" className="flex items-center space-x-2">
            {mainFlower && (
              <svg 
                className="h-8 w-8 text-primary" 
                fill="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d={mainFlower.path} />
              </svg>
            )}
            <span className="text-2xl font-bold">Happy Captions</span>
          </a>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsTourOpen(true)}
              className="rounded-full text-foreground/80 hover:bg-accent hover:text-foreground h-10 w-10 p-0"
              aria-label="Open tour"
            >
              <svg
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8"
              >
                <path d="M20 37v0m-8.7165-24.7275c.999-3.8817 4.5227-6.75 8.7165-6.75 1.6391 0 3.1761.4383 4.5 1.204m-4.5 23.546c0-10.125 9-7.875 9-15.75 0-.7769-.0985-1.5309-.2835-2.25" />
              </svg>
            </Button>
            <ThemeToggleButton />
          </div>
        </div>
      </div>
    </header>
  );
}
