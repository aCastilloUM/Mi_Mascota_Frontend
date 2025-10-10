import React from 'react';
import { useCardHealthCheck } from '../hooks/useSmartCardHeight';

/**
 * Componente de desarrollo para monitorear la salud de los cards
 * Solo se muestra en development mode
 */
export const CardHealthMonitor = () => {
  const { healthReport, scanForIssues } = useCardHealthCheck();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '8px 12px',
      borderRadius: 8,
      fontSize: 12,
      zIndex: 9999,
      maxWidth: 300
    }}>
      <div style={{ marginBottom: 8, fontWeight: 'bold' }}>
        🎯 Card Health Monitor
      </div>
      
      {healthReport.length === 0 ? (
        <div style={{ color: '#10B981' }}>✅ All cards healthy</div>
      ) : (
        <div>
          <div style={{ color: '#F59E0B', marginBottom: 4 }}>
            ⚠️ {healthReport.length} issues found:
          </div>
          {healthReport.map((issue, index) => (
            <div key={index} style={{ 
              marginBottom: 4, 
              fontSize: 11,
              color: issue.severity === 'high' ? '#EF4444' : '#F59E0B'
            }}>
              • Card {issue.cardIndex}: {issue.type}
            </div>
          ))}
        </div>
      )}
      
      <button 
        onClick={scanForIssues}
        style={{
          marginTop: 8,
          padding: '4px 8px',
          background: '#3B82F6',
          border: 'none',
          borderRadius: 4,
          color: 'white',
          fontSize: 10,
          cursor: 'pointer'
        }}
      >
        Re-scan
      </button>
    </div>
  );
};

export default CardHealthMonitor;