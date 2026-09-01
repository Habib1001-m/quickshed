'use client';

import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useAppStore } from '@/lib/store';

const pageVariants: Variants = {
  initial: { opacity: 0, scale: 0.98, y: 8 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeInOut' as const },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -4,
    transition: { duration: 0.2, ease: 'easeInOut' as const },
  },
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  const currentView = useAppStore((s) => s.currentView);
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentView}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
