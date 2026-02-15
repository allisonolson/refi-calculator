import { IconButton, ClientOnly, Skeleton } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export function ColorModeButton() {
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const updateColorMode = () => {
      const root = document.documentElement;
      const mode = root.classList.contains('dark') ||
                   root.getAttribute('data-theme') === 'dark' ||
                   (window.matchMedia('(prefers-color-scheme: dark)').matches &&
                    !localStorage.getItem('chakra-ui-color-mode'))
        ? 'dark'
        : 'light';
      setColorMode(mode);
    };

    updateColorMode();

    const observer = new MutationObserver(updateColorMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });

    return () => observer.disconnect();
  }, []);

  const toggleColorMode = () => {
    const root = document.documentElement;
    const newMode = colorMode === 'light' ? 'dark' : 'light';

    root.classList.toggle('dark');
    root.setAttribute('data-theme', newMode);
    localStorage.setItem('chakra-ui-color-mode', newMode);
    setColorMode(newMode);
  };

  return (
    <ClientOnly fallback={<Skeleton w="8" h="8" />}>
      <IconButton
        aria-label="Toggle color mode"
        onClick={toggleColorMode}
        size="sm"
        variant="ghost"
      >
        {colorMode === 'light' ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        )}
      </IconButton>
    </ClientOnly>
  );
}
