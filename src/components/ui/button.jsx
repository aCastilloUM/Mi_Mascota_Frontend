// Importa React para poder usar JSX y forwardRef
import React from "react";
import { useResponsive } from "../../hooks/useResponsive";

// Objeto con los estilos base, variantes y tamaños del botón
const buttonStyles = {
  // Estilos base para todos los botones
  base: {
    display: 'inline-flex', // El botón es un flex horizontal
    alignItems: 'center', // Centra verticalmente el contenido
    justifyContent: 'center', // Centra horizontalmente el contenido
    whiteSpace: 'nowrap', // Evita saltos de línea
    borderRadius: '8px', // Bordes redondeados
    fontSize: '14px', // Tamaño de fuente base
    fontWeight: '500', // Peso de fuente medio
    transition: 'all 0.2s', // Transición suave para hover/focus
    outline: 'none', // Sin borde de enfoque
    border: 'none', // Sin borde por defecto
    cursor: 'pointer', // Cursor de mano
    textDecoration: 'none' // Sin subrayado
  },
  // Variantes de estilo del botón
  variants: {
    default: {
      backgroundColor: '#3B82F6', // Fondo azul
      color: '#FFFFFF', // Texto blanco
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' // Sombra ligera
    },
    outline: {
      border: '1px solid #D1D5DB', // Borde gris
      backgroundColor: '#FFFFFF', // Fondo blanco
      color: '#374151', // Texto gris oscuro
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' // Sombra ligera
    },
    ghost: {
      backgroundColor: 'transparent', // Fondo transparente
      color: '#374151' // Texto gris oscuro
    }
  },
  // Ya no se usan tamaños predefinidos, todo es proporcional
};

// Componente Button reutilizable
export const Button = React.forwardRef(({ 
  className = '', // Permite agregar clases personalizadas
  variant = 'default', // Variante de estilo ('default', 'outline', 'ghost')
  disabled = false, // Si está deshabilitado
  disabled = false, // Si está deshabilitado
  widthPercent = 40, // Porcentaje de ancho (opcional, default 40%)
  children, // Contenido del botón (texto, íconos)
  ...props // Otros props (onClick, etc.)
}, ref) => {
  // Obtiene el tamaño de pantalla y helpers
  const { widthPercent: wp, heightPercent: hp } = useResponsive();

  // Calcula el ancho, alto, padding y fontSize dinámicos
  const style = {
    ...buttonStyles.base,
    ...buttonStyles.variants[variant],
    width: wp(widthPercent),
    minWidth: 80,
    maxWidth: 400,
    height: `${Math.max(32, Math.min(hp(6), 44))}px`,
    padding: `0 ${Math.max(12, Math.min(wp(5), 24))}px`,
    fontSize: `${Math.max(13, Math.min(wp(3.2), 16))}px`,
    borderRadius: `${Math.max(8, Math.min(wp(2.8), 12))}px`,
    ...(disabled && { 
      opacity: 0.5,
      cursor: 'not-allowed',
      pointerEvents: 'none'
    })
  };

  // Renderiza el botón con los estilos y props
  return (
    <button
      ref={ref} // Permite referenciar el botón desde el padre
      style={style} // Aplica los estilos calculados
      disabled={disabled} // Deshabilita el botón si corresponde
      {...props} // Pasa el resto de props (onClick, etc.)
    >
      {children} {/* Muestra el contenido dentro del botón */}
    </button>
  );
});

// Nombre para depuración en React DevTools
Button.displayName = "Button";