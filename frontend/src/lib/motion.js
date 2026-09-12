// Shared framer-motion variants so every dashboard page moves with the
// same timing and easing. Entrances ease out over ~300ms; reduced-motion
// users get none of it via MotionConfig in providers.jsx.
export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
}

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}

export const viewportOnce = { once: true, amount: 0.15 }
