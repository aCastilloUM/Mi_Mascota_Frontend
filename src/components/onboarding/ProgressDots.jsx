import React from 'react';

export default function ProgressDots({ steps = [], step = 0, onClick = () => {}, dotSize = 8, className = '' }) {
  const baseDot = {
    width: `${dotSize}px`,
    height: `${dotSize}px`,
    borderRadius: '50%',
    backgroundColor: '#E5E7EB',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
  };

  const activeDot = {
    backgroundColor: '#3B82F6',
    transform: 'scale(1.3)',
    boxShadow: '0 0 8px rgba(59, 130, 246, 0.4)'
  };

  const completedDot = {
    backgroundColor: '#10B981',
    transform: 'scale(1.1)'
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }} className={className}>
      {steps.map((_, index) => (
        <div
          key={index}
          onClick={() => onClick(index)}
          style={{
            ...baseDot,
            ...(index === step ? activeDot : {}),
            ...(index < step ? completedDot : {})
          }}
        />
      ))}
    </div>
  );
}
