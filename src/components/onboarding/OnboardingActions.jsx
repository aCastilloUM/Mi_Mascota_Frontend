import React from 'react';

export default function OnboardingActions({
  isLastStep,
  isAnimating,
  skipLabel,
  nextLabel,
  finalLabel,
  onSkip,
  onNext
}) {
  return (
    <div style={{ display: 'flex', gap: '12px', padding: '0 32px 16px', justifyContent: 'space-between', marginTop: '0px' }}>
      <button
        onClick={onSkip}
        style={{ padding: '8px 16px', border: 'none', background: 'transparent', color: '#6B7280', fontSize: '14px', fontWeight: 500, cursor: isAnimating ? 'not-allowed' : 'pointer', borderRadius: 8 }}
        disabled={isAnimating}
      >
        {skipLabel}
      </button>

      <button
        onClick={onNext}
        style={{ padding: '8px 16px', border: 'none', background: isAnimating ? 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)' : 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: isAnimating ? 'not-allowed' : 'pointer', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}
        disabled={isAnimating}
      >
        {isLastStep ? finalLabel : nextLabel}
        {!isLastStep && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 2 }}>
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </div>
  );
}
