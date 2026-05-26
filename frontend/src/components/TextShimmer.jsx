import { motion } from 'motion/react';

export function TextShimmer({ children, duration = 5, className = '' }) {
  return (
    <motion.p
      className={className}
      initial={{ backgroundPosition: '100% center' }}
      animate={{ backgroundPosition: '0% center' }}
      transition={{ repeat: Infinity, duration, ease: 'linear' }}
      style={{
        fontFamily: '"Montserrat", sans-serif',
        fontWeight: 600,
        textTransform: 'uppercase',
        backgroundImage: 'linear-gradient(135deg, #ffffff, #5E5E5E, #ffffff)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        display: 'inline-block',
      }}
    >
      {children}
    </motion.p>
  );
}