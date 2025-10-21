import React, { createContext, useContext, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { useResponsive } from "../../hooks/useResponsive";

// Context
const StepperContext = createContext();
const StepItemContext = createContext();

const useStepper = () => {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error("useStepper must be used within a Stepper");
  }
  return context;
};

const useStepItem = () => {
  const context = useContext(StepItemContext);
  if (!context) {
    throw new Error("useStepItem must be used within a StepperItem");
  }
  return context;
};

// Stepper Component
export const Stepper = React.forwardRef(({ 
  defaultValue = 1, 
  value, 
  onValueChange, 
  orientation = "horizontal", 
  className = "", 
  children,
  ...props 
}, ref) => {
  const [activeStep, setInternalStep] = useState(defaultValue);
  const { widthPercent: wp, heightPercent: hp } = useResponsive();

  const setActiveStep = (step) => {
    if (value === undefined) {
      setInternalStep(step);
    }
    onValueChange?.(step);
  };

  const currentStep = value ?? activeStep;

  // Layout responsive por porcentaje
  const style = {
    display: 'inline-flex',
    width: orientation === 'horizontal' ? wp(90) : 'auto',
    minWidth: orientation === 'horizontal' ? wp(60) : wp(30),
    maxWidth: orientation === 'horizontal' ? wp(98) : wp(60),
    flexDirection: orientation === 'horizontal' ? 'row' : 'column',
    gap: orientation === 'horizontal' ? wp(2) : hp(1),
    alignItems: 'center',
    justifyContent: 'center',
    padding: orientation === 'horizontal' ? `${hp(1)}px 0` : `0 ${wp(2)}px`,
    ...props.style
  };

  return (
    <StepperContext.Provider
      value={{
        activeStep: currentStep,
        setActiveStep,
        orientation,
      }}
    >
      <div
        ref={ref}
        style={style}
        className={className}
        {...props}
      >
        {children}
      </div>
    </StepperContext.Provider>
  );
});

// StepperItem Component
export const StepperItem = React.forwardRef(({ 
  step, 
  completed = false, 
  disabled = false, 
  className = "", 
  children, 
  ...props 
}, ref) => {
  const { activeStep, orientation } = useStepper();
  const { widthPercent: wp, heightPercent: hp } = useResponsive();

  const state = completed || step < activeStep ? "completed" : activeStep === step ? "active" : "inactive";

  // Layout responsive por porcentaje
  const style = {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    minWidth: orientation === 'horizontal' ? wp(10) : wp(30),
    maxWidth: orientation === 'horizontal' ? wp(30) : wp(60),
    minHeight: orientation === 'horizontal' ? hp(6) : hp(8),
    gap: orientation === 'horizontal' ? wp(1) : hp(1),
    padding: orientation === 'horizontal' ? `0 ${wp(1)}px` : `${hp(1)}px 0`,
    ...props.style
  };

  return (
    <StepItemContext.Provider value={{ step, state, isDisabled: disabled }}>
      <div
        ref={ref}
        style={style}
        className={className}
        data-state={state}
        {...props}
      >
        {children}
      </div>
    </StepItemContext.Provider>
  );
});

// StepperTrigger Component
export const StepperTrigger = React.forwardRef(({ 
  asChild = false, 
  className = "", 
  children, 
  ...props 
}, ref) => {
  const { setActiveStep } = useStepper();
  const { step, isDisabled } = useStepItem();
  const { widthPercent: wp, heightPercent: hp } = useResponsive();

  if (asChild) {
    return <div className={className}>{children}</div>;
  }

  // Botón responsive
  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: wp(1.5),
    background: 'none',
    border: 'none',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    pointerEvents: isDisabled ? 'none' : 'auto',
    minWidth: wp(8),
    minHeight: hp(5),
    fontSize: `${Math.max(13, Math.min(wp(2.8), 16))}px`,
    borderRadius: `${Math.max(8, Math.min(wp(2.2), 12))}px`,
    ...props.style
  };

  return (
    <button
      ref={ref}
      style={style}
      className={className}
      onClick={() => setActiveStep(step)}
      disabled={isDisabled}
      {...props}
    >
      {children}
    </button>
  );
});

// StepperIndicator Component
export const StepperIndicator = React.forwardRef(({ 
  asChild = false, 
  className = "", 
  children, 
  ...props 
}, ref) => {
  const { state, step } = useStepItem();
  const { widthPercent: wp, heightPercent: hp } = useResponsive();

  // Indicador responsive
  const baseStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: wp(100),
    minWidth: wp(8),
    maxWidth: wp(30),
    height: `${Math.max(8, Math.min(hp(1.2), 18))}px`,
    borderRadius: `${Math.max(4, Math.min(wp(1.2), 8))}px`,
    fontSize: `${Math.max(12, Math.min(wp(2.2), 15))}px`,
    fontWeight: '500',
    transition: 'all 0.2s',
    ...props.style
  };

  let style;
  switch (state) {
    case 'active':
      style = {
        ...baseStyle,
        backgroundColor: '#3B82F6',
        color: '#FFFFFF'
      };
      break;
    case 'completed':
      style = {
        ...baseStyle,
        backgroundColor: '#3B82F6',
        color: '#FFFFFF'
      };
      break;
    default:
      style = {
        ...baseStyle,
        backgroundColor: '#E5E7EB',
        color: '#9CA3AF'
      };
  }

  return (
    <div
      ref={ref}
      style={style}
      className={className}
      data-state={state}
      {...props}
    >
      {asChild ? children : null}
    </div>
  );
});

Stepper.displayName = "Stepper";
StepperItem.displayName = "StepperItem";
StepperTrigger.displayName = "StepperTrigger";
StepperIndicator.displayName = "StepperIndicator";