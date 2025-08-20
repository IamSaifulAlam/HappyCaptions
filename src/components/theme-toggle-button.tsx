
"use client";

import { useContext } from 'react';
import { cn } from '@/lib/utils';
import { ThemeContext } from '@/context/theme-context';


export default function ThemeToggleButton() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('ThemeToggleButton must be used within a ThemeProvider');
    }
    const { theme, toggleTheme } = context;


    const handleToggle = () => {
        toggleTheme();
    };

    return (
        <button
            onClick={handleToggle}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggle();
                }
            }}
            aria-label={theme === 'pink' ? "Activate blue mode" : "Activate pink mode"}
            className={cn(
                "flex items-center p-2 rounded-lg gap-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
            )}
        >
            <div
                className={cn(
                    "box flex items-center justify-center text-primary-foreground shadow-lg transition-all duration-300 ease-in-out relative overflow-hidden",
                    theme === 'pink'
                        ? "w-4 h-4 rounded-l-[2px] bg-switch-blue"
                        : "w-6 h-6 rounded-[2px] bg-primary"
                )}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
            </div>
            <div
                className={cn(
                    "box flex items-center justify-center text-primary-foreground shadow-lg transition-all duration-300 ease-in-out relative overflow-hidden",
                     theme === 'blue'
                        ? "w-4 h-4 rounded-r-[2px] bg-switch-blue"
                        : "w-6 h-6 rounded-[2px] bg-primary"
                )}
            >
                 <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
            </div>
        </button>
    );
}
