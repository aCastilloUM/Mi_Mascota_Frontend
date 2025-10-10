import { useMemo } from "react";
import { useResponsiveText } from "./useResponsiveText";

/**
 * Hook para estilos compartidos de componentes de autenticación
 * Centraliza todos los estilos comunes y responsive del sistema
 */
export const useAuthStyles = () => {
  const { title: titleSize, body: bodySize, label: labelSize, small: smallSize, button: buttonSize } = useResponsiveText();

  const styles = useMemo(() => {
    const rounded = "'Segoe UI Rounded', 'Arial Rounded MT Bold', Arial, sans-serif";

    return {
      // Layout base
      form: {
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        width: "100%",
        padding: "0",
      },

      // Tipografía
      title: {
        fontSize: titleSize,
        fontWeight: "700",
        color: "#111827",
        margin: "0 0 6px 0",
        fontFamily: rounded,
        textAlign: "center",
      },

      subtitle: {
        fontSize: bodySize,
        color: "#6B7280",
        margin: "0 0 20px 0",
        fontFamily: rounded,
        textAlign: "center",
        lineHeight: "1.4",
      },

      label: {
        fontSize: labelSize,
        fontWeight: "600",
        color: "#374151",
        margin: "0 0 6px 0",
        fontFamily: rounded,
        display: "block",
      },

      // Campos de formulario
      field: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        width: "100%",
      },

      fieldGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      },

      fieldRow: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "12px",
      },

      // Estados de input
      inputError: {
        border: "1px solid rgba(255, 85, 85, 0.65)",
      },

      inputSuccess: {
        border: "1px solid rgba(100, 200, 120, 0.55)",
      },

      // Textos de estado
      errorText: {
        color: '#EF4444',
        fontSize: smallSize,
        margin: '2px 0 0 0',
        fontFamily: rounded,
      },

      successText: {
        color: '#10B981',
        fontSize: smallSize,
        margin: '2px 0 0 0',
        fontFamily: rounded,
      },

      helperText: {
        color: '#6B7280',
        fontSize: smallSize,
        margin: '2px 0 0 0',
        fontFamily: rounded,
      },

      // Botones
      primaryButton: {
        backgroundColor: "#3B82F6",
        color: "#fff",
        border: "none",
        padding: "12px 20px",
        borderRadius: "8px",
        fontSize: buttonSize,
        fontWeight: "600",
        cursor: "pointer",
        fontFamily: rounded,
        transition: "all 0.2s ease",
        width: "100%",
        height: "46px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },

      secondaryButton: {
        backgroundColor: "transparent",
        color: "#3B82F6",
        border: "1px solid #3B82F6",
        padding: "12px 20px",
        borderRadius: "8px",
        fontSize: buttonSize,
        fontWeight: "600",
        cursor: "pointer",
        fontFamily: rounded,
        transition: "all 0.2s ease",
        width: "100%",
        height: "46px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },

      ghostButton: {
        backgroundColor: "transparent",
        color: "#6B7280",
        border: "none",
        padding: "8px 0",
        borderRadius: "6px",
        fontSize: smallSize,
        fontWeight: "500",
        cursor: "pointer",
        fontFamily: rounded,
        transition: "all 0.2s ease",
        textAlign: "center",
        textDecoration: "underline",
        alignSelf: "flex-start",
      },

      // Secciones específicas
      passwordToggle: {
        position: "absolute",
        right: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#6B7280",
        padding: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },

      socialSection: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        marginBottom: "16px",
      },

      socialButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "10px 16px",
        border: "1px solid #E5E7EB",
        borderRadius: "8px",
        backgroundColor: "#fff",
        color: "#374151",
        fontSize: smallSize,
        fontWeight: "500",
        cursor: "pointer",
        fontFamily: rounded,
        transition: "all 0.2s ease",
        width: "100%",
      },

      divider: {
        display: 'flex',
        alignItems: 'center',
        margin: '16px 0',
        gap: '12px'
      },

      dividerLine: {
        flex: 1,
        height: '1px',
        backgroundColor: '#E5E7EB'
      },

      dividerText: {
        fontSize: smallSize,
        color: '#6B7280',
        fontFamily: rounded,
      },

      // Navegación entre páginas
      registerSection: {
        display: "flex",
        gap: "8px",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px 0 0 0",
        marginTop: "8px",
        borderTop: "1px solid rgba(0,0,0,0.08)",
      },

      registerText: {
        fontSize: smallSize,
        color: "#6B7280",
        fontFamily: rounded,
      },

      registerBtn: {
        border: "1px solid #3B82F6",
        background: "#3B82F6",
        color: "#fff",
        padding: "6px 12px",
        borderRadius: "6px",
        fontSize: smallSize,
        fontWeight: "600",
        cursor: "pointer",
        fontFamily: rounded,
        transition: "all 0.2s ease",
      },

      // Estados de loading
      loadingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "8px",
        zIndex: 10,
      },

      // Contenedores específicos
      stepIndicator: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        marginBottom: "16px",
      },

      termsSection: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        marginBottom: '20px',
        padding: '14px',
        backgroundColor: '#F9FAFB',
        borderRadius: '8px',
        border: '1px solid #E5E7EB'
      },

      checkbox: {
        width: '16px',
        height: '16px',
        marginTop: '2px',
        flexShrink: 0
      },

      termsText: {
        fontSize: smallSize,
        color: '#374151',
        lineHeight: '1.4',
        fontFamily: rounded,
      },

      termsLink: {
        color: '#3B82F6',
        textDecoration: 'none'
      },

      // Animaciones y transiciones
      fadeIn: {
        opacity: 1,
        transform: "translateY(0)",
        transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
      },

      fadeOut: {
        opacity: 0,
        transform: "translateY(20px)",
        transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
      }
    };
  }, [titleSize, bodySize, labelSize, smallSize, buttonSize]);

  return styles;
};