import React, { useState, useRef, useEffect } from 'react';

/**
 * Input especializado para códigos 2FA de 6 dígitos
 * Cada dígito en una caja separada, auto-focus y validación
 */
export function TwoFactorInput({ 
  value = '', 
  onChange, 
  onComplete,
  disabled = false,
  autoFocus = true,
  className = '',
  error = null
}) {
  const [digits, setDigits] = useState(Array(6).fill(''));
  const inputRefs = useRef([]);

  // Sincronizar con prop value
  useEffect(() => {
    if (value.length <= 6) {
      const newDigits = value.split('').concat(Array(6 - value.length).fill(''));
      setDigits(newDigits.slice(0, 6));
    }
  }, [value]);

  // Auto-focus en el primer input
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index, digit) => {
    // Solo permitir números
    if (digit && !/^\d$/.test(digit)) return;
    // ...existing code...
    // Responsive: usar tamaño de pantalla
    const { widthPercent, heightPercent } = require('../../hooks/useResponsive').useResponsive();
    const inputStyle = {
      width: `${Math.max(28, Math.min(widthPercent(8), 48))}px`,
      height: `${Math.max(36, Math.min(heightPercent(7), 54))}px`,
      fontSize: `${Math.max(18, Math.min(widthPercent(4.2), 28))}px`,
      textAlign: 'center',
      borderRadius: `${Math.max(6, Math.min(widthPercent(2.2), 12))}px`,
      border: error ? '2px solid #EF4444' : '2px solid #3B82F6',
      background: '#fff',
      margin: `0 ${Math.max(2, Math.min(widthPercent(1.2), 8))}px`,
      boxShadow: error ? '0 0 0 2px #F87171' : '0 2px 8px rgba(59,130,246,0.08)',
      outline: 'none',
      transition: 'all 0.18s',
      fontWeight: '600',
      caretColor: '#3B82F6',
      letterSpacing: '2px',
    };
  };

  const handleKeyDown = (index, e) => {
    // Backspace: borrar y ir al anterior
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    
    // Arrow keys para navegación
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Enter: intentar completar
    if (e.key === 'Enter') {
      const currentValue = digits.join('');
      if (currentValue.length === 6) {
        onComplete?.(currentValue);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const cleanedData = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (cleanedData.length > 0) {
      const newDigits = cleanedData.split('').concat(Array(6 - cleanedData.length).fill(''));
      setDigits(newDigits.slice(0, 6));
      onChange?.(cleanedData);
      
      if (cleanedData.length === 6) {
        onComplete?.(cleanedData);
      } else {
        // Focus en el siguiente input vacío
        const nextIndex = cleanedData.length;
        if (nextIndex < 6) {
          inputRefs.current[nextIndex]?.focus();
        }
      }
    }
  };

  return (
    <div className={`two-factor-input ${className}`}>
      <div style={styles.container}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            style={{
              ...styles.input,
              ...(error ? styles.inputError : {}),
              ...(disabled ? styles.inputDisabled : {})
            }}
            autoComplete="one-time-code"
          />
        ))}
      </div>
      
      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}
      
      <div style={styles.hint}>
        Ingresa el código de 6 dígitos de tu app autenticadora
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    alignItems: 'center',
  },

  input: {
    width: '48px',
    height: '56px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: '600',
    color: '#1f2937',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s ease',
    outline: 'none',
    fontFamily: 'monospace',
  },

  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },

  inputDisabled: {
    backgroundColor: '#f9fafb',
    color: '#9ca3af',
    cursor: 'not-allowed',
  },

  error: {
    color: '#ef4444',
    fontSize: '14px',
    textAlign: 'center',
    marginTop: '8px',
    fontWeight: '500',
  },

  hint: {
    color: '#6b7280',
    fontSize: '12px',
    textAlign: 'center',
    marginTop: '8px',
  },
};

// CSS adicional para focus states
const injectStyles = () => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
      .two-factor-input input:focus {
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        background-color: #ffffff !important;
      }
      
      .two-factor-input input:hover:not(:disabled) {
        border-color: #9ca3af !important;
      }
    `;
    document.head.appendChild(style);
  }
};

// Inyectar estilos al cargar el componente
if (typeof document !== 'undefined') {
  injectStyles();
}