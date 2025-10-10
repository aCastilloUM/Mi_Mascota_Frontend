import React from "react";
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";
import { useResponsiveText } from "../../hooks/useResponsiveText";

/**
 * Componente reutilizable para mostrar mensajes de estado
 * Centraliza todos los tipos de mensajes: error, éxito, info, warning
 */
export const StatusMessage = ({ 
  type = "error", 
  message, 
  onClose,
  showIcon = true,
  className = "",
  style = {}
}) => {
  const { small: smallSize } = useResponsiveText();
  
  if (!message) return null;

  const messageStyles = getMessageStyles(type, smallSize);
  const Icon = getIcon(type);

  return (
    <div 
      className={`status-message ${className}`}
      style={{
        ...messageStyles.container,
        ...style
      }}
    >
      {showIcon && Icon && (
        <Icon 
          size={16} 
          style={messageStyles.icon}
        />
      )}
      
      <span style={messageStyles.text}>
        {message}
      </span>
      
      {onClose && (
        <button
          onClick={onClose}
          style={messageStyles.closeButton}
          aria-label="Cerrar mensaje"
        >
          <FiX size={14} />
        </button>
      )}
    </div>
  );
};

/**
 * Componente específico para errores
 */
export const ErrorMessage = ({ message, onClose, ...props }) => (
  <StatusMessage 
    type="error" 
    message={message} 
    onClose={onClose}
    {...props}
  />
);

/**
 * Componente específico para éxito
 */
export const SuccessMessage = ({ message, onClose, ...props }) => (
  <StatusMessage 
    type="success" 
    message={message} 
    onClose={onClose}
    {...props}
  />
);

/**
 * Componente específico para información
 */
export const InfoMessage = ({ message, onClose, ...props }) => (
  <StatusMessage 
    type="info" 
    message={message} 
    onClose={onClose}
    {...props}
  />
);

/**
 * Componente específico para advertencias
 */
export const WarningMessage = ({ message, onClose, ...props }) => (
  <StatusMessage 
    type="warning" 
    message={message} 
    onClose={onClose}
    {...props}
  />
);

/**
 * Componente para validaciones de campo
 */
export const FieldMessage = ({ 
  error, 
  success, 
  helper, 
  touched = false,
  ...props 
}) => {
  if (error && touched) {
    return <ErrorMessage message={error} {...props} />;
  }
  
  if (success && touched) {
    return <SuccessMessage message={success} {...props} />;
  }
  
  if (helper) {
    return <InfoMessage message={helper} {...props} />;
  }
  
  return null;
};

// Funciones auxiliares
const getIcon = (type) => {
  const icons = {
    error: FiAlertCircle,
    success: FiCheckCircle,
    info: FiInfo,
    warning: FiAlertCircle
  };
  
  return icons[type];
};

const getMessageStyles = (type, fontSize) => {
  const rounded = "'Segoe UI Rounded', 'Arial Rounded MT Bold', Arial, sans-serif";
  
  const baseStyles = {
    container: {
      display: "flex",
      alignItems: "flex-start",
      gap: "8px",
      padding: "10px 12px",
      borderRadius: "8px",
      fontSize: fontSize,
      fontFamily: rounded,
      lineHeight: "1.4",
      border: "1px solid",
      margin: "4px 0"
    },
    text: {
      flex: 1,
      margin: 0
    },
    icon: {
      flexShrink: 0,
      marginTop: "1px"
    },
    closeButton: {
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "2px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "4px",
      transition: "background-color 0.2s ease",
      flexShrink: 0
    }
  };

  const typeStyles = {
    error: {
      container: {
        ...baseStyles.container,
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderColor: "rgba(239, 68, 68, 0.3)",
        color: "#DC2626"
      },
      text: baseStyles.text,
      icon: {
        ...baseStyles.icon,
        color: "#DC2626"
      },
      closeButton: {
        ...baseStyles.closeButton,
        color: "#DC2626"
      }
    },
    
    success: {
      container: {
        ...baseStyles.container,
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderColor: "rgba(16, 185, 129, 0.3)",
        color: "#059669"
      },
      text: baseStyles.text,
      icon: {
        ...baseStyles.icon,
        color: "#059669"
      },
      closeButton: {
        ...baseStyles.closeButton,
        color: "#059669"
      }
    },
    
    info: {
      container: {
        ...baseStyles.container,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "rgba(59, 130, 246, 0.3)",
        color: "#2563EB"
      },
      text: baseStyles.text,
      icon: {
        ...baseStyles.icon,
        color: "#2563EB"
      },
      closeButton: {
        ...baseStyles.closeButton,
        color: "#2563EB"
      }
    },
    
    warning: {
      container: {
        ...baseStyles.container,
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        borderColor: "rgba(245, 158, 11, 0.3)",
        color: "#D97706"
      },
      text: baseStyles.text,
      icon: {
        ...baseStyles.icon,
        color: "#D97706"
      },
      closeButton: {
        ...baseStyles.closeButton,
        color: "#D97706"
      }
    }
  };

  return typeStyles[type] || typeStyles.info;
};