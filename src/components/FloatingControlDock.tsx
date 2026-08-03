import type { ReactNode } from 'react';

interface FloatingControlDockProps {
  children: ReactNode;
}

/**
 * Shared layout slot for the end-side floating controls.
 *
 * The dock owns the fixed positioning and bottom reservation. Individual
 * controls stay in normal flow so appearing/disappearing controls and the
 * expanded quick-actions menu cannot occupy the same coordinates.
 */
export function FloatingControlDock({ children }: FloatingControlDockProps) {
  return (
    <div className="floating-control-dock" data-testid="floating-control-dock">
      {children}
    </div>
  );
}
