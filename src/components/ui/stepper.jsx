import React, { createContext, useContext, useState } from "react";
import { FiCheck } from "react-icons/fi";

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

  const setActiveStep = (step) => {
    if (value === undefined) {
      setInternalStep(step);
    }
    onValueChange?.(step);
  };

  const currentStep = value ?? activeStep;

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
        style={{
          display: 'inline-flex',
          width: orientation === 'horizontal' ? '100%' : 'auto',
          flexDirection: orientation === 'horizontal' ? 'row' : 'column'
        }}
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
  const { activeStep } = useStepper();

  const state = completed || step < activeStep ? "completed" : activeStep === step ? "active" : "inactive";

  return (
    <StepItemContext.Provider value={{ step, state, isDisabled: disabled }}>
      <div
        ref={ref}
        style={{
          display: 'flex',
          alignItems: 'center',
          flex: 1
        }}
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

  if (asChild) {
    return <div className={className}>{children}</div>;
  }

  return (
    <button
      ref={ref}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        background: 'none',
        border: 'none',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        pointerEvents: isDisabled ? 'none' : 'auto'
      }}
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

  const getIndicatorStyle = () => {
    const baseStyle = {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '8px',
      borderRadius: '0px',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'all 0.2s'
    };

    switch (state) {
      case 'active':
        return {
          ...baseStyle,
          backgroundColor: '#3B82F6',
          color: '#FFFFFF'
        };
      case 'completed':
        return {
          ...baseStyle,
          backgroundColor: '#3B82F6',
          color: '#FFFFFF'
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#E5E7EB',
          color: '#9CA3AF'
        };
    }
  };

  return (
    <div
      ref={ref}
      style={getIndicatorStyle()}
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