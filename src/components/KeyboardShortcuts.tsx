'use client';

import { useEffect } from 'react';

export function KeyboardShortcuts() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Cmd+K or Ctrl+K: Focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Find the search input in the header and focus it
        const searchInput = document.querySelector('header input[type="text"]') as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
      // Escape: Close search/navigate back
      if (e.key === 'Escape') {
        const activeEl = document.activeElement;
        if (activeEl instanceof HTMLInputElement) {
          activeEl.blur();
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return null;
}
