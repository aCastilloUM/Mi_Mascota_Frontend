import React from "react";

const buttonStyles = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    outline: 'none',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none'
  },
  variants: {
    default: {
      backgroundColor: '#3B82F6',
      color: '#FFFFFF',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
    },
    outline: {
      border: '1px solid #D1D5DB',
      backgroundColor: '#FFFFFF',
      color: '#374151',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#374151'
    }
  },
  sizes: {
    default: {
      height: '36px',
      padding: '8px 16px'
    },
    sm: {
      height: '32px',
      padding: '6px 12px',
      fontSize: '12px'
    },
    lg: {
      height: '40px',
      padding: '10px 32px'
    }
  }
};

export const Button = React.forwardRef(({ 
  className = '', 
  variant = 'default', 
  size = 'default', 
  disabled = false,
  children, 
  ...props 
}, ref) => {
  const style = {
    ...buttonStyles.base,
    ...buttonStyles.variants[variant],
    ...buttonStyles.sizes[size],
    ...(disabled && { 
      opacity: 0.5, 
      cursor: 'not-allowed',
      pointerEvents: 'none'
    })
  };

  return (
    <button
      ref={ref}
      style={style}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";