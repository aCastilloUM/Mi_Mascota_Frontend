import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiEye, FiEyeOff, FiUser, FiShield, FiCamera, FiSkipForward } from "react-icons/fi";
import { createOrUpdateProfile, uploadProfilePhoto, login } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { AnimatedButton } from "../components/ui/AnimatedButton";
import { AnimatedInput, AnimatedSelect } from "../components/ui/AnimatedInput";
import { Stepper, StepperItem, StepperTrigger, StepperIndicator } from "../components/ui/stepper";
import { AuthLayout, AuthCenterWrap } from "../components/ui/AuthLayout";
import { AuthCard, AuthCardContent } from "../components/ui/AuthCard";
import { Logo, LogoWrap } from "../components/ui/Logo";
import { useResponsiveText } from "../hooks/useResponsiveText";
import { useResponsive } from "../hooks/useResponsive";
import { AuthCardTransition, useAuthNavigation } from "../animations";
import zxcvbn from "zxcvbn";

// Esquema de validación
const schema = z
  .object({
    // Paso 1: Información básicas
    name: z.string().trim().min(1, "El nombre es requerido"),
    secondName: z.string().trim().min(1, "El apellido es requerido"),
    email: z
      .string()
      .email("Ingresá un correo válido")
      .regex(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Formato de email inválido"
      ),
    role: z.enum(["client", "provider"], { errorMap: () => ({ message: "Elegí un rol" }) }),
    documentType: z.enum(["CI", "Pasaporte"], { errorMap: () => ({ message: "Elegí un tipo" }) }),
    document: z
      .string()
      .trim()
      .regex(/^\d{8}$/, "El documento debe tener exactamente 8 dígitos"),
    birthDate: z
      .string()
      .min(1, "La fecha de nacimiento es requerida")
      .refine((dateString) => {
        if (!dateString) return false;
        
        // Convertir fecha del formato YYYY-MM-DD a Date
        const birthDate = new Date(dateString);
        const today = new Date();
        
        // Calcular la edad
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        return age >= 16;
      }, "Debes ser mayor de 16 años"),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos 1 mayúscula")
      .regex(/[a-z]/, "Debe contener al menos 1 minúscula")
      .regex(/[0-9]/, "Debe contener al menos 1 dígito")
      .regex(/[^A-Za-z0-9]/, "Debe contener al menos 1 carácter especial")
      .refine((value) => !/\s/.test(value), { message: "No puede contener espacios" }),
    confirmPassword: z.string().min(1, "Confirmá tu contraseña"),
    
    // Paso 2: Ubicación
    department: z.string().trim().min(1, "Requerido"),
    city: z.string().trim().min(1, "Requerido"),
    postalCode: z.string().trim().min(1, "Requerido"),
    street: z.string().trim().min(1, "Requerido"),
    number: z.string().trim().min(1, "Requerido"),
    apartment: z.string().trim().optional(),
    
    // Paso 3: Términos
    acceptTerms: z.boolean().refine(val => val === true, "Debes aceptar los términos"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

const steps = [1, 2, 3];

// Estilos
const styles = {
  input: {
    width: '100%',
    height: '32px',
    padding: '8px 12px',
    border: '1.5px solid #E2E8F0',
    borderRadius: '8px',
    outline: 'none',
    fontSize: '14px',
    backgroundColor: '#FFFFFF',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    ':focus': {
      borderColor: '#3B82F6',
      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)'
    },
    ':hover': {
      borderColor: '#CBD5E0'
    }
  },
  select: {
    width: '100%',
    height: '38px',
    padding: '8px 12px',
    border: '1.5px solid #E2E8F0',
    borderRadius: '8px',
    outline: 'none',
    fontSize: '14px',
    backgroundColor: '#FFFFFF',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 8px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '16px',
    paddingRight: '32px'
  },
  label: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '3px',
    display: 'block'
  },
  error: {
    color: '#EF4444',
    fontSize: '10px',
    margin: '2px 0 0 0'
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '10px'
  }
};

export default function Register() {
  const router = useAuthNavigation();
  const { register: authRegister } = useAuth();
  const { title, small } = useResponsiveText();
  const { height } = useResponsive();
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState('next'); // 'next' o 'prev'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    trigger,
    getValues,
    setValue
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      role: "client",
      documentType: "CI",
    },
  });

  const watchedValues = watch();

  // Función para validar el paso actual
  const validateStep = async (step) => {
    let fieldsToValidate = [];
    
    switch (step) {
      case 1:
        fieldsToValidate = ["name", "secondName", "email", "password", "confirmPassword"];
        break;
      case 2:
        fieldsToValidate = ["documentType", "document", "birthDate", "department", "city", "postalCode", "street", "number"];
        break;
      case 3:
        fieldsToValidate = ["role", "acceptTerms"];
        break;
    }
    
    const result = await trigger(fieldsToValidate);
    return result;
  };

  // Función para ir al siguiente paso
  const nextStep = async () => {
    if (isAnimating) return; // Prevenir múltiples clicks durante animación
    
    const isValidStep = await validateStep(currentStep);
    if (isValidStep) {
      setIsAnimating(true);
      setDirection('next');
      setTimeout(() => {
        setCurrentStep(prev => Math.min(prev + 1, steps.length));
        setTimeout(() => setIsAnimating(false), 50);
      }, 150);
    }
  };
 

  // Función para ir al paso anterior
  const prevStep = () => {
    if (isAnimating) return; // Prevenir múltiples clicks durante animación
    
    setIsAnimating(true);
    setDirection('prev');
    setTimeout(() => {
      setCurrentStep(prev => Math.max(prev - 1, 1));
      setTimeout(() => setIsAnimating(false), 50);
    }, 150);
  };

  // Función para manejar la carga de foto de perfil
  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen debe ser menor a 5MB');
        return;
      }
      
      setProfilePhoto(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError(''); // Limpiar errores previos
    }
  };

  // Función para enviar el formulario
  const onSubmit = async (data) => {
    // Limpiar cualquier token existente para evitar falsas detecciones
    localStorage.removeItem('accessToken');
    
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      // Convertir fecha de yyyy-mm-dd a dd/MM/yyyy
      const formatDateForBackend = (dateString) => {
        if (!dateString) return "";
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year}`;
      };

      // 1. Primero registrar el usuario (auth) - estructura que espera el backend
      const authPayload = {
        baseUser: {
          name: data.name.trim(),
          secondName: data.secondName.trim(),
          email: data.email.trim().toLowerCase(),
          documentType: data.documentType,
          document: data.document.trim(),
          ubication: {
            department: data.department.trim(),
            city: data.city.trim(),
            postalCode: data.postalCode.trim(),
            street: data.street.trim(),
            number: data.number.trim(),
            apartment: data.apartment?.trim() || null,
          },
          password: data.password,
        },
        client: {
          birthDate: formatDateForBackend(data.birthDate), // formato dd/MM/yyyy que espera el backend
        },
      };

      const registerResp = await authRegister(authPayload);

      // Guardar el email en sessionStorage para que otras pantallas (verify) lo puedan mostrar
      try {
        sessionStorage.setItem('mimascota:register_email', data.email.trim().toLowerCase());
      } catch (e) {
        // noop
      }

      // Mostrar la pantalla de verificación de email con el email registrado.
      // En desarrollo el backend puede devolver el verification_token, en cuyo caso la página
      // lo mostrará (solo si EXPOSE_DEV_VERIFICATION_TOKEN está activo). En producción normalmente
      // el token no se retorna por seguridad, por eso siempre navegamos a la pantalla de espera.
      router.navigateWithoutAnimation('/email-verification-pending', { state: { email: data.email.trim().toLowerCase(), token: registerResp?.verification_token || null } });
      return; // no continuar con login automático ni subida de foto
    } catch (e) {
      // Manejo específico de errores del backend
      if (e.response?.status === 409) {
        // Error 409 específicamente para email duplicado
        const errorDetail = e?.response?.data?.detail || e?.response?.data?.message || "";
        
        // Solo mostrar error de email duplicado si realmente es por email
        if (errorDetail.toLowerCase().includes("email") || 
            errorDetail.toLowerCase().includes("already exists") || 
            errorDetail.toLowerCase().includes("ya existe")) {
          setError("⚠️ Este email ya está registrado. ¿Querés iniciar sesión?");
        } else {
          setError("⚠️ Ya existe un registro con estos datos. Verificá la información ingresada.");
        }
      } else if (e.response?.status === 400) {
        const detail = e?.response?.data?.detail;
        let backendMessage = "";

        if (typeof detail === "string") {
          backendMessage = detail;
        } else if (detail?.message) {
          backendMessage = detail.message;
        } else if (Array.isArray(detail) && detail.length) {
          backendMessage = detail[0]?.msg || detail[0]?.message || "";
        }

        setError(backendMessage || "❌ Datos inválidos. Por favor, verificá la información ingresada");
      } else if (e.response?.status >= 500) {
        setError("🔧 Error del servidor. Por favor, intentá más tarde");
      } else if (e.code === 'NETWORK_ERROR' || !e.response) {
        setError("🌐 Error de conexión. Verificá tu conexión a internet");
      } else {
        const msg = e?.response?.data?.detail || e?.response?.data?.error || e?.response?.data?.message || e?.message || "❌ No pudimos crear tu cuenta";
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para calcular fortaleza de contraseña
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, feedback: [] };
    return zxcvbn(password);
  };

  const passwordStrength = getPasswordStrength(watchedValues.password);

  // Función para obtener color de fortaleza
  const getStrengthColor = (score) => {
    const colors = ['#EF4444', '#F59E0B', '#F59E0B', '#10B981', '#059669'];
    return colors[score] || '#EF4444';
  };

  // Función para obtener texto de fortaleza
  const getStrengthText = (score) => {
    const texts = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Excelente'];
    return texts[score] || 'Muy débil';
  };

  return (
    <AuthLayout>
      <AuthCenterWrap>
        <AuthCardTransition {...router.getPageProps()}>
          {/* Logo arriba del card */}
          <LogoWrap>
            <Logo />
          </LogoWrap>

          <AuthCard cardType="register" autoHeight={true}>
          <AuthCardContent>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            padding: '0 16px 2px' // Reducido padding
          }}>
            <h2 style={{
              fontSize: title,
              fontWeight: 'bold',
              color: '#111827',
              margin: '0 0 4px 0' // Reducido margen
            }}>
              Crear cuenta
            </h2>
            <p style={{
              color: '#6B7280',
              fontSize: small,
              margin: '0 0 10px 0' // Reducido margen
            }}>
              Paso {currentStep} de {steps.length}
            </p>
          </div>

          {/* Indicador de progreso */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '0 16px 12px', // Reducido padding
            gap: '4px' // Reducido gap
          }}>
            {steps.map((step, index) => (
              <div
                key={step}
                onClick={() => {
                  if (!isAnimating && index + 1 !== currentStep) {
                    setIsAnimating(true);
                    setDirection(index + 1 > currentStep ? 'next' : 'prev');
                    setTimeout(() => {
                      setCurrentStep(index + 1);
                      setTimeout(() => setIsAnimating(false), 50);
                    }, 150);
                  }
                }}
                style={{
                  height: '4px',
                  flex: 1,
                  borderRadius: '2px',
                  backgroundColor: index + 1 <= currentStep ? '#3B82F6' : '#E5E7EB',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transform: index + 1 === currentStep ? 'scaleY(1.2)' : 'scaleY(1)',
                  boxShadow: index + 1 === currentStep ? '0 0 8px rgba(59, 130, 246, 0.4)' : 'none'
                }}
              />
            ))}
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '0 16px' }}> {/* Reducido padding */}
            {/* Error global */}
            {error && (
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#B91C1C',
                padding: '6px 10px', // Reducido padding
                borderRadius: '6px',
                fontSize: '11px', // Reducido font size
                marginBottom: '8px' // Reducido margen
              }}>
                {error}
              </div>
            )}

            {/* Éxito global */}
            {success && (
              <div style={{
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                color: '#15803D',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                ✅ ¡Cuenta creada exitosamente! Redirigiendo...
              </div>
            )}

            {/* Paso 1: Información Personal + Login Social */}
            {currentStep === 1 && (
              <div
                style={{
                  opacity: isAnimating ? 0.3 : 1,
                  transform: isAnimating 
                    ? direction === 'next' 
                      ? 'translateX(-20px)' 
                      : 'translateX(20px)'
                    : 'translateX(0)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
              <div>
                {/* Login Social */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px', // Reducido de 8px
                  marginBottom: '12px' // Reducido de 16px
                }}>
                  <button
                    type="button"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px', // Reducido
                      width: '100%',
                      height: '32px', // Altura fija igual a inputs
                      padding: '0 12px', // Padding horizontal solamente
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px', // Reducido
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer',
                      fontSize: '13px', // Reducido
                      fontWeight: '500',
                      color: '#374151',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#F9FAFB'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#FFFFFF'}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continuar con Google
                  </button>

                  <div style={{
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <button
                      type="button"
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px', // Reducido para botones más pequeños
                        height: '32px', // Altura fija igual a inputs
                        padding: '0 8px', // Padding horizontal solamente
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px', // Reducido
                        backgroundColor: '#FFFFFF',
                        cursor: 'pointer',
                        fontSize: '12px', // Reducido más para que quepa
                        fontWeight: '500',
                        color: '#374151',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24">
                        <path fill="#1877f2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </button>
                    <button
                      type="button"
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px', // Reducido
                        height: '32px', // Altura fija igual a inputs
                        padding: '0 8px', // Padding horizontal solamente
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px', // Reducido
                        backgroundColor: '#000000',
                        cursor: 'pointer',
                        fontSize: '12px', // Reducido
                        fontWeight: '500',
                        color: '#FFFFFF',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                      Apple
                    </button>
                  </div>
                </div>

                {/* Separador */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '12px 0', // Reducido de 16px
                  gap: '8px' // Reducido de 12px
                }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
                  <span style={{ fontSize: '11px', color: '#6B7280' }}>o</span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
                </div>

                {/* Nombre y Apellido */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '6px', // Reducido de 8px
                  marginBottom: '3px'
                }}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Nombre</label>
                    <AnimatedInput
                      {...register("name")}
                      placeholder="Tu nombre"
                      style={{
                        width: '100%',
                        height: '32px'
                      }}
                    />
                    {errors.name && <p style={styles.error}>{errors.name.message}</p>}
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Apellido</label>
                    <AnimatedInput
                      {...register("secondName")}
                      placeholder="Tu apellido"
                      style={{
                        width: '100%',
                        height: '32px'
                      }}
                    />
                    {errors.secondName && <p style={styles.error}>{errors.secondName.message}</p>}
                  </div>
                </div>

                {/* Email */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Email</label>
                  <AnimatedInput
                    type="email"
                    {...register("email")}
                    placeholder="tu@email.com"
                    style={{
                        width: '100%',
                        height: '32px'
                      }}
                  />
                  {errors.email && <p style={styles.error}>{errors.email.message}</p>}
                </div>

                {/* Contraseña */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Contraseña</label>
                  <div style={{ position: 'relative' }}>
                    <AnimatedInput
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      placeholder="Tu contraseña"
                      style={{
                        width: '100%',
                        height: '32px',
                        paddingRight: '40px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6B7280'
                      }}
                    >
                      {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                    </button>
                  </div>
                  
                  {/* Indicador de fortaleza */}
                  {watchedValues.password && (
                    <div style={{ marginTop: '4px' }}>
                      <div style={{
                        height: '3px',
                        backgroundColor: '#E5E7EB',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${(passwordStrength.score + 1) * 20}%`,
                          backgroundColor: getStrengthColor(passwordStrength.score),
                          transition: 'all 0.3s ease'
                        }} />
                      </div>
                      <p style={{
                        fontSize: '10px',
                        color: getStrengthColor(passwordStrength.score),
                        margin: '2px 0 0 0'
                      }}>
                        {getStrengthText(passwordStrength.score)}
                      </p>
                    </div>
                  )}
                  
                  {errors.password && <p style={styles.error}>{errors.password.message}</p>}
                </div>

                {/* Confirmar Contraseña */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Confirmar contraseña</label>
                  <div style={{ position: 'relative' }}>
                    <AnimatedInput
                      type={showConfirmPassword ? "text" : "password"}
                      {...register("confirmPassword")}
                      placeholder="Repetí tu contraseña"
                      style={{
                        width: '100%',
                        height: '32px',
                        paddingRight: '40px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6B7280'
                      }}
                    >
                      {showConfirmPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p style={styles.error}>{errors.confirmPassword.message}</p>}
                </div>
              </div>
            </div>
            )}

            {/* Paso 2: Documentos y Ubicación */}
            {currentStep === 2 && (
              <div
                style={{
                  opacity: isAnimating ? 0.3 : 1,
                  transform: isAnimating 
                    ? direction === 'next' 
                      ? 'translateX(-20px)' 
                      : 'translateX(20px)'
                    : 'translateX(0)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
              <div>
                {/* Documento */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  marginBottom: '3px'
                }}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Tipo de documento</label>
                    <AnimatedSelect
                      {...register("documentType")}

                      style={{
                        ...styles.select,
                        width: '100%',
                        height: '32px'
                      }}
                    >
                      <option value="CI">Cédula</option>
                      <option value="Pasaporte">Pasaporte</option>
                    </AnimatedSelect>
                    {errors.documentType && <p style={styles.error}>{errors.documentType.message}</p>}
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Número</label>
                    <AnimatedInput
                      {...register("document")}
                      placeholder="12345678"
                      style={{
                        width: '100%',
                        height: '32px'
                      }}
                    />
                    {errors.document && <p style={styles.error}>{errors.document.message}</p>}
                  </div>
                </div>

                {/* Fecha de nacimiento */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Fecha de nacimiento</label>
                  <AnimatedInput
                    type="date"
                    {...register("birthDate")}
                    style={{
                        width: '100%',
                        height: '32px'
                      }}
                  />
                  {errors.birthDate && <p style={styles.error}>{errors.birthDate.message}</p>}
                </div>

                {/* Ubicación */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  marginBottom: '3px'
                }}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Departamento</label>
                    <AnimatedInput
                      {...register("department")}
                      placeholder="Montevideo"
                      style={{
                        width: '100%',
                        height: '32px'
                      }}
                    />
                    {errors.department && <p style={styles.error}>{errors.department.message}</p>}
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Ciudad</label>
                    <AnimatedInput
                      {...register("city")}
                      placeholder="Ciudad"
                      style={{
                        width: '100%',
                        height: '32px'
                      }}
                    />
                    {errors.city && <p style={styles.error}>{errors.city.message}</p>}
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '6px',
                  marginBottom: '3px'
                }}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>C. Postal</label>
                    <AnimatedInput
                      {...register("postalCode")}
                      placeholder="11000"
                      style={{
                        width: '100%',
                        height: '32px'
                      }}
                    />
                    {errors.postalCode && <p style={styles.error}>{errors.postalCode.message}</p>}
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Calle</label>
                    <AnimatedInput
                      {...register("street")}
                      placeholder="18 de Julio"
                      style={{
                        width: '100%',
                        height: '32px '
                      }}
                    />
                    {errors.street && <p style={styles.error}>{errors.street.message}</p>}
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Número</label>
                    <AnimatedInput
                      {...register("number")}
                      placeholder="1234"
                      style={{
                        width: '100%',
                        height: '32px'
                      }}
                    />
                    {errors.number && <p style={styles.error}>{errors.number.message}</p>}
                  </div>
                </div>

                {/* Apartamento */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Apartamento (opcional)</label>
                  <AnimatedInput
                    {...register("apartment")}
                    placeholder="Apt 5B"
                    style={{
                        width: '100%',
                        height: '32px'
                      }}
                  />
                </div>
              </div>
            </div>
            )}

            {/* Paso 3: Foto de perfil y Términos */}
            {currentStep === 3 && (
              <div
                style={{
                  opacity: isAnimating ? 0.3 : 1,
                  transform: isAnimating 
                    ? direction === 'next' 
                      ? 'translateX(-20px)' 
                      : 'translateX(20px)'
                    : 'translateX(0)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
              <div>
                <div style={{
                  textAlign: 'center',
                  marginBottom: '20px'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#111827',
                    margin: '0 0 6px 0'
                  }}>
                    Crear cuenta
                  </h3>
                  <p style={{
                    fontSize: '12px',
                    color: '#6B7280',
                    margin: '0 0 4px 0',
                    lineHeight: '1.4'
                  }}>
                    ¡Bienvenido! Crea tu cuenta para comenzar.
                  </p>
                  <p style={{
                    fontSize: '11px',
                    color: '#6B7280',
                    margin: '0 0 20px 0'
                  }}>
                    Paso 3 de 3
                  </p>
                </div>

                {/* Selector de tipo de cuenta */}
                <div style={{ marginBottom: '20px' }}>
                  <p style={{
                    fontSize: '12px',
                    color: '#374151',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    Tipo de cuenta
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <button
                      type="button"
                      onClick={() => setValue("role", "client")}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: `2px solid ${watchedValues.role === 'client' ? '#3B82F6' : '#E5E7EB'}`,
                        borderRadius: '8px',
                        backgroundColor: watchedValues.role === 'client' ? '#EFF6FF' : '#FFFFFF',
                        color: watchedValues.role === 'client' ? '#3B82F6' : '#6B7280',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <FiUser size={16} />
                      Usuario
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue("role", "provider")}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: `2px solid ${watchedValues.role === 'provider' ? '#3B82F6' : '#E5E7EB'}`,
                        borderRadius: '8px',
                        backgroundColor: watchedValues.role === 'provider' ? '#EFF6FF' : '#FFFFFF',
                        color: watchedValues.role === 'provider' ? '#3B82F6' : '#6B7280',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <FiShield size={16} />
                      Proveedor
                    </button>
                  </div>
                  {errors.role && <p style={styles.error}>{errors.role.message}</p>}
                </div>

                {/* Foto de perfil */}
                <div style={{ marginBottom: '20px' }}>
                  <p style={{
                    fontSize: '12px',
                    color: '#374151',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    Foto de perfil
                  </p>
                  <p style={{
                    fontSize: '11px',
                    color: '#6B7280',
                    marginBottom: '12px'
                  }}>
                    Agrega una foto para personalizar tu perfil (opcional)
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    {/* Preview de la foto o placeholder */}
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      border: '2px dashed #D1D5DB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#F9FAFB',
                      overflow: 'hidden'
                    }}>
                      {photoPreview ? (
                        <img 
                          src={photoPreview} 
                          alt="Preview"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <FiCamera style={{
                          width: '24px',
                          height: '24px',
                          color: '#9CA3AF'
                        }} />
                      )}
                    </div>
                    
                    {/* Botón de subir foto */}
                    <label style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      backgroundColor: '#3B82F6',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '500',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      border: 'none',
                      transition: 'background-color 0.2s'
                    }}>
                      <FiCamera size={14} />
                      Subir foto
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </div>

                {/* Términos */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  marginBottom: '20px'
                }}>
                  <input
                    type="checkbox"
                    {...register("acceptTerms")}
                    style={{
                      marginTop: '2px',
                      width: '16px',
                      height: '16px'
                    }}
                  />
                  <label style={{
                    fontSize: '12px',
                    color: '#6B7280',
                    lineHeight: '1.4'
                  }}>
                    Acepto los{" "}
                    <a href="#" style={{ color: '#3B82F6', textDecoration: 'underline' }}>
                      Términos y Condiciones
                    </a>{" "}
                    y la{" "}
                    <a href="#" style={{ color: '#3B82F6', textDecoration: 'underline' }}>
                      Política de Privacidad
                    </a>
                  </label>
                </div>
                {errors.acceptTerms && <p style={styles.error}>{errors.acceptTerms.message}</p>}
                
                {error && (
                  <p style={{
                    ...styles.error,
                    textAlign: 'center'
                  }}>
                    {error}
                  </p>
                )}
              </div>
            </div>
            )}

            {/* Botones de navegación */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '10px',
              marginTop: '20px'
            }}>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={isAnimating}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: isAnimating ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: isAnimating ? 0.5 : 1,
                    transform: isAnimating ? 'scale(0.98)' : 'scale(1)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Anterior
                </button>
              )}

              {currentStep < steps.length ? (
                <AnimatedButton
                  type="button"
                  onClick={nextStep}
                  disabled={isAnimating}
                  style={{
                    flex: currentStep === 1 ? 1 : 1,
                    padding: '10px 16px',
                    fontSize: '14px',
                    opacity: isAnimating ? 0.7 : 1,
                    transform: isAnimating ? 'scale(0.98)' : 'scale(1)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: isAnimating ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isAnimating ? 'Cargando...' : 'Siguiente'}
                </AnimatedButton>
              ) : (
                <AnimatedButton
                  type="submit"
                  disabled={loading || isAnimating}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    opacity: (loading || isAnimating) ? 0.7 : 1,
                    transform: (loading || isAnimating) ? 'scale(0.98)' : 'scale(1)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    fontSize: '14px',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? (success ? "✅ Redirigiendo..." : "Creando cuenta...") : "Crear cuenta"}
                </AnimatedButton>
              )}
            </div>
          </form>

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            padding: '16px 20px 0',
            borderTop: '1px solid #E5E7EB',
            marginTop: '20px'
          }}>
            <p style={{
              fontSize: '12px',
              color: '#6B7280',
              margin: 0
            }}>
              ¿Ya tenés cuenta?{" "}
              <button
                type="button"
                onClick={() => router.toLogin('register')}
                disabled={router.isTransitioning}
                style={{
                  color: '#3B82F6',
                  background: 'none',
                  border: 'none',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '12px',
                  opacity: router.isTransitioning ? 0.6 : 1
                }}
              >
                Iniciá sesión
              </button>
            </p>
          </div>
          </AuthCardContent>
        </AuthCard>
        </AuthCardTransition>
      </AuthCenterWrap>
      
      {/* Estilos CSS para animaciones y efectos hover */}
  <style>{`
        button:hover:not(:disabled) {
          transform: translateY(-1px) !important;
        }
        
        button:active:not(:disabled) {
          transform: translateY(0px) scale(0.98) !important;
        }
        
        .progress-bar:hover {
          transform: scaleY(1.4) !important;
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.3) !important;
        }
        
        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translateX(30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translateX(-30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </AuthLayout>
  );
}