import React, { useState } from 'react';
import { useResponsive } from "../../hooks/useResponsive";

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

  // Usar unidades basadas en ancho (vw) con clamp para evitar que el campo cambie de tamaño cuando
  // visualViewport cambia al scrollear en móviles (hide/show address bar).
  const baseStyle = {
    width: '100%',
    height: 'clamp(28px, 4.5vw, 38px)',
    padding: 'clamp(4px, 1.2vw, 8px) clamp(8px, 3vw, 18px)',
    borderRadius: 'clamp(6px, 2.2vw, 10px)',
    outline: 'none',
    fontSize: 'clamp(12px, 2.8vw, 15px)',
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
    height: 'clamp(36px, 3.5vw, 44px)',
    padding: 'clamp(6px, 1.5vw, 10px) clamp(12px, 3vw, 18px)',
    borderRadius: 'clamp(8px, 2.2vw, 12px)',
    outline: 'none',
    fontSize: 'clamp(14px, 2.6vw, 16px)',
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