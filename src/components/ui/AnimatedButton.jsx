import React from "react";
import { useResponsive } from "../../hooks/useResponsive";

export const AnimatedButton = React.forwardRef(({ 
  variant = "default", 
  size = "default", 
  disabled = false,
  children, 
  style = {},
  ...props 
}, ref) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

  const { widthPercent, heightPercent } = useResponsive();
  const getBaseStyle = () => {
    // Tamaños proporcionales
    const baseSize = size === 'sm' ? {
      height: `${Math.max(28, Math.min(heightPercent(5), 38))}px`,
      padding: `0 ${Math.max(10, Math.min(widthPercent(4), 18))}px`,
      fontSize: `${Math.max(12, Math.min(widthPercent(2.8), 15))}px`,
      borderRadius: `${Math.max(6, Math.min(widthPercent(2.2), 10))}px`
    } : size === 'lg' ? {
      height: `${Math.max(38, Math.min(heightPercent(7), 54))}px`,
      padding: `0 ${Math.max(16, Math.min(widthPercent(6), 32))}px`,
      fontSize: `${Math.max(14, Math.min(widthPercent(3.5), 18))}px`,
      borderRadius: `${Math.max(10, Math.min(widthPercent(3.2), 16))}px`
    } : {
      height: `${Math.max(32, Math.min(heightPercent(6), 44))}px`,
      padding: `0 ${Math.max(12, Math.min(widthPercent(5), 24))}px`,
      fontSize: `${Math.max(13, Math.min(widthPercent(3.2), 16))}px`,
      borderRadius: `${Math.max(8, Math.min(widthPercent(2.8), 12))}px`
    };

    return {
      ...baseSize,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      whiteSpace: 'nowrap',
      outline: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'inherit',
      userSelect: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden'
    };
  };

  const getVariantStyle = () => {
    if (disabled) {
      return {
        backgroundColor: '#9CA3AF',
        color: '#FFFFFF',
        border: 'none',
        boxShadow: 'none',
        opacity: 0.6
      };
    }

    if (variant === 'outline') {
      return {
        backgroundColor: isHovered ? '#EFF6FF' : 'transparent',
        color: '#3B82F6',
        border: '2px solid #3B82F6',
        boxShadow: isHovered 
          ? '0 4px 12px rgba(59, 130, 246, 0.3)' 
          : '0 2px 8px rgba(59, 130, 246, 0.2)',
        transform: isPressed ? 'translateY(1px)' : isHovered ? 'translateY(-1px)' : 'translateY(0)'
      };
    }

    if (variant === 'ghost') {
      return {
        backgroundColor: isHovered ? '#F9FAFB' : 'transparent',
        color: isHovered ? '#374151' : '#6B7280',
        border: '2px solid #E5E7EB',
        boxShadow: isHovered 
          ? '0 4px 8px rgba(0, 0, 0, 0.15)' 
          : '0 2px 4px rgba(0, 0, 0, 0.1)',
        transform: isPressed ? 'translateY(1px)' : isHovered ? 'translateY(-1px)' : 'translateY(0)'
      };
    }

    // Default variant
    return {
      backgroundColor: isHovered ? '#2563EB' : '#3B82F6',
      color: 'white',
      border: 'none',
      boxShadow: isHovered 
        ? '0 6px 20px rgba(59, 130, 246, 0.5)' 
        : '0 4px 14px rgba(59, 130, 246, 0.4)',
      transform: isPressed ? 'translateY(1px)' : isHovered ? 'translateY(-2px)' : 'translateY(0)'
    };
  };

  const finalStyle = {
    ...getBaseStyle(),
    ...getVariantStyle(),
    ...style
  };

  return (
    <button
      ref={ref}
      style={finalStyle}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      {...props}
    >
      {children}
    </button>
  );
});

AnimatedButton.displayName = "AnimatedButton";