import { useState, useEffect, useRef } from 'react';
import { useResponsive } from './useResponsive';

/**
 * Hook inteligente para detectar y prevenir espacios en blanco en cards
 * Identifica automáticamente si un card necesita altura fija o responsive
 */
export const useSmartCardHeight = (cardType = 'auto') => {
  const { isMobile, height, width } = useResponsive();
  const [cardConfig, setCardConfig] = useState({
    autoHeight: false,
    optimalHeight: 'auto',
    shouldUseFixedHeight: true,
    debugInfo: {}
  });
  const cardRef = useRef(null);

  useEffect(() => {
    // Configuraciones predefinidas por tipo de página
    const cardTypeConfigs = {
      'login': {
        autoHeight: false,
        reason: 'Contenido simple y fijo - evita espacio blanco'
      },
      'register': {
        autoHeight: true,
        reason: 'Contenido denso - necesita adaptarse al viewport'
      },
      'email-verification': {
        autoHeight: true,
        reason: 'Contenido moderado - necesita adaptarse al viewport'
      },
      'verify-email': {
        autoHeight: true,
        reason: 'Contenido variable - necesita adaptarse al viewport'
      },
      'onboarding': {
        autoHeight: true,
        reason: 'Contenido con navegación - necesita adaptarse al viewport'
      }
    };

    const analyzeContent = () => {
      if (cardRef.current) {
        const contentElement = cardRef.current.querySelector('[data-card-content]') || cardRef.current;
        const contentHeight = contentElement.scrollHeight;
        const viewportHeight = height;
        const availableHeight = isMobile ? viewportHeight * 0.75 : viewportHeight * 0.85;
        
        // Métricas para detección inteligente
        const metrics = {
          contentHeight,
          viewportHeight,
          availableHeight,
          contentToViewportRatio: contentHeight / viewportHeight,
          isMobile,
          exceedsViewport: contentHeight > availableHeight,
          isContentDense: contentHeight > 500,
          isContentSimple: contentHeight < 350
        };

        // Lógica de detección inteligente
        let config;
        if (cardType !== 'auto' && cardTypeConfigs[cardType]) {
          // Usar configuración predefinida con altura inteligente
          const baseConfig = cardTypeConfigs[cardType];
          config = {
            ...baseConfig,
            optimalHeight: baseConfig.autoHeight 
              ? Math.min(contentHeight + 40, availableHeight) // +40 para padding
              : 'auto'
          };
        } else {
          // Detección automática
          if (metrics.exceedsViewport || metrics.isContentDense) {
            config = {
              autoHeight: true,
              optimalHeight: Math.min(contentHeight + 40, availableHeight),
              reason: 'Contenido denso detectado - usando altura responsive'
            };
          } else {
            config = {
              autoHeight: false,
              optimalHeight: 'auto',
              reason: 'Contenido simple detectado - usando altura automática'
            };
          }
        }

        setCardConfig({
          ...config,
          shouldUseFixedHeight: !config.autoHeight,
          debugInfo: {
            ...metrics,
            cardType,
            appliedConfig: config.reason
          }
        });

        // Log de debugging en desarrollo
        if (process.env.NODE_ENV === 'development') {
          console.log(`🎯 SmartCardHeight Analysis for ${cardType}:`, {
            metrics,
            appliedConfig: config,
            recommendation: config.reason
          });
        }
      }
    };

    // Analizar después de que el DOM se actualice
    const timer = setTimeout(analyzeContent, 150);
    
    // Re-analizar en cambios de tamaño
    const handleResize = () => {
      setTimeout(analyzeContent, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [cardType, height, width, isMobile]);

  return {
    cardRef,
    ...cardConfig
  };
};

/**
 * Hook para validar cards existentes y detectar problemas
 */
export const useCardHealthCheck = () => {
  const [healthReport, setHealthReport] = useState([]);

  const scanForIssues = () => {
    const cards = document.querySelectorAll('[class*="auth-card"], [data-testid*="card"]');
    const issues = [];

    cards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const hasWhitespace = cardRect.height < (card.scrollHeight * 0.8);
      const exceedsViewport = cardRect.height > viewportHeight * 0.9;
      
      if (hasWhitespace) {
        issues.push({
          cardIndex: index,
          type: 'whitespace',
          severity: 'medium',
          message: 'Card tiene espacio en blanco innecesario',
          recommendation: 'Usar autoHeight={false} o ajustar contenido'
        });
      }
      
      if (exceedsViewport) {
        issues.push({
          cardIndex: index,
          type: 'overflow',
          severity: 'high',
          message: 'Card excede el viewport en móviles',
          recommendation: 'Usar autoHeight={true} con límite de altura'
        });
      }
    });

    setHealthReport(issues);
    
    if (process.env.NODE_ENV === 'development' && issues.length > 0) {
      console.warn('🚨 Card Health Check - Issues found:', issues);
    }
    
    return issues;
  };

  useEffect(() => {
    // Escanear después de que la página cargue
    const timer = setTimeout(scanForIssues, 1000);
    return () => clearTimeout(timer);
  }, []);

  return {
    healthReport,
    scanForIssues
  };
};