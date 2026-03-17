import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ComponentProps<typeof motion.button> {
  variant?: 'primary' | 'secondary' | 'flat';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'flat', children, style, ...props }) => {
  const getColors = () => {
    // Uses the new invert variable for high contrast text
    if (variant === 'primary') return { color: 'var(--primary-invert)', backgroundColor: 'var(--primary)' };
    if (variant === 'secondary') return { color: 'var(--primary-invert)', backgroundColor: 'var(--secondary)' };
    return { color: 'var(--text-primary)', backgroundColor: 'transparent' };
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        padding: '12px 24px',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '1rem',
        ...getColors(),
        ...style
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
};