
"use client";

import { useState, useMemo, useEffect } from 'react';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeContext, type Theme } from '@/context/theme-context';
import { cn } from '@/lib/utils';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const LOCAL_STORAGE_KEY_THEME = "happycaptions-theme";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [theme, setTheme] = useState<Theme>('pink');
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME) as Theme | null;
    if (storedTheme && ['pink', 'blue'].includes(storedTheme)) {
      setTheme(storedTheme);
    }
    
    const timer = setTimeout(() => {
      setIsThemeLoaded(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => {
        const newTheme = prevTheme === 'pink' ? 'blue' : 'pink';
        localStorage.setItem(LOCAL_STORAGE_KEY_THEME, newTheme);
        return newTheme;
    });
  };

  const contextValue = useMemo(() => ({
    theme,
    toggleTheme,
    isThemeLoaded,
  }), [theme, isThemeLoaded]);

  const themeClass = theme === 'blue' ? 'theme-blue' : 'theme-pink';

  return (
    <html lang="en" suppressHydrationWarning className={isThemeLoaded ? themeClass : ''}>
      <head>
        <title>HappyCaptions - AI Social Media Assistant</title>
        <meta name="description" content="Generate captivating captions and relevant hashtags for your social media posts with HappyCaptions, your AI-powered content assistant." />
        <meta name="keywords" content="AI social media, content generation, caption generator, hashtag generator, social media marketing, Next.js, Genkit, unlimited post generator from image, bangla post generator, bangla caption generator, free caption generator, ai caption generator, best caption generator" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://happy-caption.com/" />
        <meta property="og:title" content="HappyCaptions - AI Social Media Assistant" />
        <meta property="og:description" content="Generate captivating captions and relevant hashtags for your social media posts with HappyCaptions, your AI-powered content assistant." />
        <meta property="og:image" content="https://happy-caption.com/og-image.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://happy-caption.com/" />
        <meta property="twitter:title" content="HappyCaptions - AI Social Media Assistant" />
        <meta property="twitter:description" content="Generate captivating captions and relevant hashtags for your social media posts with HappyCaptions, your AI-powered content assistant." />
        <meta property="twitter:image" content="https://happy-caption.com/og-image.png" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body 
        className="font-body antialiased bg-background text-foreground transition-colors duration-300"
        suppressHydrationWarning
      >
        <ThemeContext.Provider value={contextValue}>
          {isThemeLoaded ? (
            children
          ) : (
            <div className={cn("fixed inset-0 flex items-center justify-center bg-white theme-pink")}>
              <div className="flex items-center justify-center gap-5">
                <div
                  className="box w-[50px] h-[50px] rounded-[4px] bg-switch-blue animate-loop"
                />
                <div
                  className="box w-[80px] h-[80px] rounded-[4px] bg-primary animate-reverse-loop"
                />
              </div>
            </div>
          )}
        </ThemeContext.Provider>
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
