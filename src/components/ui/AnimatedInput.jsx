import React, { useState } from 'react';

export const AnimatedInput = React.forwardRef(({ 
  type = 'text',
  placeholder = '',
  style = {},
  onFocus,
  onBlur,
  ...props 
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const baseStyle = {
    width: '100%',
    height: '32px', // Reducido de 36px a 32px
    padding: '6px 10px', // Reducido padding
    borderRadius: '6px', // Reducido de 8px
    outline: 'none',
    fontSize: '13px', // Reducido de 14px
    backgroundColor: '#FFFFFF',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    border: isFocused 
      ? '2px solid #3B82F6' 
      : isHovered 
        ? '1.5px solid #C7D2FE' 
        : '1.5px solid #E2E8F0',
    boxShadow: isFocused 
      ? '0 0 0 3px rgba(59, 130, 246, 0.1), 0 2px 6px rgba(0, 0, 0, 0.1)' 
      : isHovered 
        ? '0 2px 6px rgba(0, 0, 0, 0.15)' 
        : '0 1px 3px rgba(0, 0, 0, 0.1)',
    transform: isFocused ? 'translateY(-1px)' : 'translateY(0)',
    // Prevenir autocomplete styling en móviles
    WebkitBoxShadow: '0 0 0 1000px #FFFFFF inset !important',
    WebkitTextFillColor: '#000000 !important',
    caretColor: '#3B82F6'
  };

  return (
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      style={{ ...baseStyle, ...style }}
      onFocus={(e) => {
        setIsFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        onBlur?.(e);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    />
  );
});

AnimatedInput.displayName = "AnimatedInput";

export const AnimatedSelect = React.forwardRef(({ 
  children,
  style = {},
  onFocus,
  onBlur,
  onChange,
  value,
  name,
  ...props 
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const baseStyle = {
    width: '100%',
    height: '36px',
    padding: '6px 12px',
    borderRadius: '8px',
    outline: 'none',
    fontSize: '14px',
    backgroundColor: '#FFFFFF',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    border: isFocused 
      ? '2px solid #3B82F6' 
      : isHovered 
        ? '1.5px solid #C7D2FE' 
        : '1.5px solid #E2E8F0',
    boxShadow: isFocused 
      ? '0 0 0 3px rgba(59, 130, 246, 0.1), 0 2px 6px rgba(0, 0, 0, 0.1)' 
      : isHovered 
        ? '0 2px 6px rgba(0, 0, 0, 0.15)' 
        : '0 1px 3px rgba(0, 0, 0, 0.1)',
    transform: isFocused ? 'translateY(-1px)' : 'translateY(0)',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '16px',
    paddingRight: '40px'
  };

  return (
    <select
      ref={ref}
      name={name}
      value={value}
      onChange={onChange}
      style={{ ...baseStyle, ...style }}
      onFocus={(e) => {
        setIsFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        onBlur?.(e);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </select>
  );
});

AnimatedSelect.displayName = "AnimatedSelect";