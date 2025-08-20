
"use client";

import { useState, useMemo, useEffect, type RefObject } from "react";
import { Pause, Play, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import patterns from "@/app/pattern.json";
import { cn } from "@/lib/utils";

const SHAPE_COUNT = 40;
const SHAPE_SIZE = 80;

type Shape = {
    id: number;
    top: string;
    left: string;
    width: string;
    height: string;
    path: string;
    viewBox: string;
    animationDuration: string;
    animationDelay: string;
};

const generateShapes = (): Shape[] => {
    const newShapes: Shape[] = [];
    for (let i = 0; i < SHAPE_COUNT; i++) {
        const randomPattern = patterns.patterns[Math.floor(Math.random() * patterns.patterns.length)];
        newShapes.push({
            id: i,
            top: '110vh', // All start from below the screen
            left: `${Math.random() * 100}%`,
            animationDuration: `${30 + Math.random() * 10}s`,
            animationDelay: `${Math.random() * 40}s`, // Varied delay for a staggered entry effect
            width: `${SHAPE_SIZE}px`,
            height: `${SHAPE_SIZE}px`,
            path: randomPattern.path,
            viewBox: randomPattern.viewBox,
        });
    }
    return newShapes;
};

type FloatingShapesProps = {
    onScrollToTop: () => void;
    scrollableRef: RefObject<HTMLElement>;
};

export default function FloatingShapes({ onScrollToTop, scrollableRef }: FloatingShapesProps) {
    const [isPlaying, setIsPlaying] = useState(true);
    const [showScrollTop, setShowScrollTop] = useState(false);
    
    const shapes = useMemo(() => generateShapes(), []);

    useEffect(() => {
        const handleScroll = () => {
            const mainScrollTop = scrollableRef.current?.scrollTop ?? 0;
            const windowScrollTop = window.scrollY;
            setShowScrollTop(mainScrollTop > 200 || windowScrollTop > 200);
        };

        const scrollEl = scrollableRef.current;
        scrollEl?.addEventListener('scroll', handleScroll);
        window.addEventListener('scroll', handleScroll);

        return () => {
            scrollEl?.removeEventListener('scroll', handleScroll);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrollableRef]);
    
    return (
        <>
            <div className="floating-shapes" style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}>
                {shapes.map(shape => (
                    <span
                        key={shape.id}
                        className="shape animate-up"
                        style={{
                            top: shape.top,
                            left: shape.left,
                            width: shape.width,
                            height: shape.height,
                            animationDuration: shape.animationDuration,
                            animationDelay: shape.animationDelay,
                            animationPlayState: isPlaying ? 'running' : 'paused',
                        } as React.CSSProperties}
                    >
                        <svg viewBox={shape.viewBox} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d={shape.path} />
                        </svg>
                    </span>
                ))}
            </div>
            <div className="fixed bottom-12 right-1 z-30 flex flex-col items-center gap-3 md:bottom-7 md:right-7 lg:bottom-2 lg:right-2 md:gap-4">
                 {showScrollTop && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onScrollToTop}
                        className="rounded-full text-primary/80 hover:bg-accent hover:text-primary"
                        aria-label="Go to top"
                    >
                        <ArrowUp className="h-5 w-5" />
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="rounded-full text-primary/80 hover:bg-accent hover:text-primary"
                    aria-label={isPlaying ? "Pause animation" : "Play animation"}
                >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
            </div>
        </>
    );
}
