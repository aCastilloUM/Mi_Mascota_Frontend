import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiEye, FiEyeOff, FiUser, FiShield, FiCamera, FiSkipForward } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { BeamsBackground } from "./BeamsBackground";
import { AnimatedButton } from "./AnimatedButton";
import { AnimatedInput, AnimatedSelect } from "./AnimatedInput";
import { Stepper, StepperItem, StepperTrigger, StepperIndicator } from "./stepper";
import logoTop from "../../assets/logos/dog+cat.png";
import zxcvbn from "zxcvbn";

// Esquema de validación
const schema = z
  .object({
    // Paso 1: Información básica
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
    height: '20px',
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
      borderColor: '#C7D2FE',
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)'
    }
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
    gap: '3px',
    marginBottom: '10px'
  },
  formLayout: {
    display: 'grid',
    gap: '3px',
    width: '100%',
    maxWidth: '260px',
    margin: '0 auto'
  },
  twoCols: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '10px',
    justifyItems: 'stretch'
  },
  singleCol: {
    display: 'grid',
    gap: '3px'
  },
  threeCols: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
    gap: '8px',
    justifyItems: 'stretch'
  }
};

export default function MultiStepRegisterForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    getValues
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      role: "client",
      documentType: "CI",
    },
    mode: "onChange"
  });

  const selectedRole = watch("role");
  const passwordValue = watch("password");

  const normalizeBirthDate = (value) => {
    if (!value) return "";
    if (value.includes("/")) {
      return value;
    }
    const parts = value.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      if (year && month && day) {
        return `${day}/${month}/${year}`;
      }
    }
    return value;
  };

  const toNullIfEmpty = (value) => {
    if (typeof value !== "string") {
      return null;
    }
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  };

  // Validar fortaleza de contraseña
  React.useEffect(() => {
    if (passwordValue) {
      const result = zxcvbn(passwordValue);
      setPasswordStrength({
        score: result.score,
        feedback: result.feedback.suggestions
      });
    }
  }, [passwordValue]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ['name', 'secondName', 'email', 'birthDate', 'password', 'confirmPassword'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['documentType', 'document', 'department', 'city', 'postalCode', 'street', 'number', 'role'];
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data) => {
    setError("");

    if (data.role !== "client") {
      setError("Por ahora solo podemos registrar cuentas de usuario.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
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
            apartment: toNullIfEmpty(data.apartment),
          },
          password: data.password,
        },
        client: {
          birthDate: normalizeBirthDate(data.birthDate),
        },
      };

      await api.post("/auth/register", payload);
      navigate("/onboarding");
    } catch (e) {
      const detail = e?.response?.data?.detail;
      let backendMessage = "";

      if (typeof detail === "string") {
        backendMessage = detail;
      } else if (detail?.message) {
        backendMessage = detail.message;
      } else if (Array.isArray(detail) && detail.length) {
        backendMessage = detail[0]?.msg || detail[0]?.message || "";
      }

      const msg =
        backendMessage ||
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.message ||
        "No pudimos crear tu cuenta";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = (score) => {
    const colors = ['#EF4444', '#F59E0B', '#F59E0B', '#10B981', '#059669'];
    return colors[score] || '#EF4444';
  };

  const getPasswordStrengthText = (score) => {
    const texts = ['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte'];
    return texts[score] || 'Muy débil';
  };

  return (
    <BeamsBackground>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '124px 18px',
        overflowY: 'auto',
        boxSizing: 'border-box',
        zIndex: 10
      }}>
        <div style={{
          width: '100%',
          maxWidth: '320px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(6px)',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          overflow: 'hidden',
          margin: '0 auto'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            padding: '30px 20px 3px'
          }}>
            <img
              src={logoTop}
              alt="Mi Mascota"
              style={{
                width: '80px',
                height: '70px',
                margin: '0 auto 3px'
              }}
            />
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#111827',
              margin: '0 0 6px 0'
            }}>
              Crear cuenta
            </h2>
            <p style={{
              color: '#6B7280',
              fontSize: '13px',
              margin: 0
            }}>
              ¡Bienvenido! Creá tu cuenta para comenzar.
            </p>
          </div>

          {/* Stepper */}
          <div style={{ padding: '0 20px 12px' }}>
            <Stepper value={currentStep} onValueChange={setCurrentStep}>
              {steps.map((step) => (
                <StepperItem key={step} step={step} completed={step < currentStep}>
                  <StepperTrigger asChild>
                    <StepperIndicator asChild>
                      <div style={{ width: '100%' }} />
                    </StepperIndicator>
                  </StepperTrigger>
                </StepperItem>
              ))}
            </Stepper>
            <div style={{
              textAlign: 'center',
              marginTop: '3px',
              fontSize: '12px',
              fontWeight: '500',
              color: '#6B7280'
            }}>
              Paso {currentStep} de {steps.length}
            </div>
          </div>

          {/* Form Content */}
          <div style={{ padding: '3px 24px 20px' }}>
            <form onSubmit={handleSubmit(onSubmit)} style={styles.formLayout}>
              {error && (
                <div style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#B91C1C',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginBottom: '20px'
                }}>
                  {error}
                </div>
              )}

              {/* PASO 1: Información Personal */}
              {currentStep === 1 && (
                <div style={styles.singleCol}>
                  {/* Nombre y Apellido */}
                  <div style={styles.twoCols}>
                    <div>
                      <label style={styles.label}>Nombre</label>
                      <AnimatedInput
                        {...register("name")}
                        placeholder="Tu nombre"
                        style={{ width: '80%', height: '20px' }}
                      />
                      {errors.name && <p style={styles.error}>{errors.name.message}</p>}
                    </div>
                    <div>
                      <label style={styles.label}>Apellido</label>
                      <AnimatedInput
                        {...register("secondName")}
                        placeholder="Tu apellido"
                        style={{ width: '80%', height: '20px' }}
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
                      style={{ width: '90%', height: '20px' }}
                    />
                    {errors.email && <p style={styles.error}>{errors.email.message}</p>}
                  </div>

                  {/* Fecha de nacimiento */}
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Fecha de nacimiento</label>
                    <AnimatedInput
                      type="date"
                      {...register("birthDate")}
                      style={{ width: '90%', height: '20px' }}
                    />
                    {errors.birthDate && <p style={styles.error}>{errors.birthDate.message}</p>}
                  </div>

                  {/* Contraseñas */}
                  <div style={{ ...styles.twoCols, alignItems: 'flex-start' }}>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Contraseña</label>
                      <div style={{ position: 'relative' }}>
                        <AnimatedInput
                          type={showPassword ? "text" : "password"}
                          {...register("password")}
                          placeholder="Contraseña"
                          style={{ width: '80%' , height: '20px'}}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: 'absolute',
                            right: '0px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#6B7280',
                            width: '22px',
                            height: '22px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                      </div>
                      {passwordValue && (
                        <div style={{ marginTop: '6px' }}>
                          <div style={{
                            height: '4px',
                            backgroundColor: '#E5E7EB',
                            borderRadius: '2px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              height: '100%',
                              width: `${(passwordStrength.score + 1) * 20}%`,
                              backgroundColor: getPasswordStrengthColor(passwordStrength.score),
                              transition: 'all 0.3s'
                            }} />
                          </div>
                          <p style={{
                            fontSize: '11px',
                            color: getPasswordStrengthColor(passwordStrength.score),
                            margin: '4px 0 0 0'
                          }}>
                            {getPasswordStrengthText(passwordStrength.score)}
                          </p>
                        </div>
                      )}
                      {errors.password && <p style={styles.error}>{errors.password.message}</p>}
                    </div>

                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Confirmar contraseña</label>
                      <div style={{ position: 'relative' }}>
                        <AnimatedInput
                          type={showConfirmPassword ? "text" : "password"}
                          {...register("confirmPassword")}
                          style={{ 
                            paddingRight: '32px',
                            width: '64%',
                            height: '20px'
                          }}
                          placeholder="Contraseña"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{
                            position: 'absolute',
                            right: '1px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#6B7280',
                            width: '22px',
                            height: '22px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p style={styles.error}>{errors.confirmPassword.message}</p>}
                    </div>
                  </div>

                  {/* Sección de login social */}
                  <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <p style={{
                      fontSize: '14px',
                      color: '#6B7280',
                      margin: '0 0 20px 0'
                    }}>
                      o continúa con
                    </p>
                    
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      {/* Google */}
                      <button
                        type="button"
                        onClick={() => console.log('Google login')}
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '24px',
                          border: '1px solid #E5E7EB',
                          backgroundColor: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#F9FAFB'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#FFFFFF'}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </button>

                      {/* Facebook */}
                      <button
                        type="button"
                        onClick={() => console.log('Facebook login')}
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '24px',
                          border: '1px solid #E5E7EB',
                          backgroundColor: '#1877F2',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#166FE5'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#1877F2'}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </button>

                      {/* Apple */}
                      <button
                        type="button"
                        onClick={() => console.log('Apple login')}
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '24px',
                          border: '1px solid #E5E7EB',
                          backgroundColor: '#000000',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#333333'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#000000'}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 2: Documentación y Ubicación */}
              {currentStep === 2 && (
                <div style={styles.singleCol}>
                  {/* Documento */}
                  <div style={styles.twoCols}>
                    <div>
                      <label style={styles.label}>Tipo de documento</label>
                      <AnimatedSelect
                        {...register("documentType")}
                        style={{ 
                          width: '100%', 
                          height: '36px',
                          fontSize: '14px'
                        }}
                      >
                        <option value="CI">CI</option>
                        <option value="Pasaporte">Pasaporte</option>
                      </AnimatedSelect>
                      {errors.documentType && <p style={styles.error}>{errors.documentType.message}</p>}
                    </div>
                    <div>
                      <label style={styles.label}>Número</label>
                      <AnimatedInput
                        {...register("document")}
                        placeholder="123456789"
                        style={{ width: '80%', height: '20px' }}
                      />
                      {errors.document && <p style={styles.error}>{errors.document.message}</p>}
                    </div>
                  </div>

                  {/* Departamento y Ciudad */}
                  <div style={{ ...styles.twoCols, marginBottom: '10px' }}>
                    <div>
                      <label style={styles.label}>Departamento</label>
                      <AnimatedInput
                        {...register("department")}
                        style={{ 
                            width: '80%',
                            height: '20px'
                          }}
                        placeholder="Montevideo"
                      />
                      {errors.department && <p style={styles.error}>{errors.department.message}</p>}
                    </div>
                    <div>
                      <label style={styles.label}>Ciudad</label>
                      <AnimatedInput
                        {...register("city")}
                        style={{ 
                            width: '80%',
                            height: '20px'
                          }}
                        placeholder="Departamento"
                      />
                      {errors.city && <p style={styles.error}>{errors.city.message}</p>}
                    </div>
                  </div>

                  {/* Código Postal, Calle y Número */}
                  <div style={{ ...styles.threeCols, marginBottom: '10px' }}>
                    <div>
                      <label style={styles.label}>C. Postal</label>
                      <AnimatedInput
                        {...register("postalCode")}
                        style={{ 
                            width: '70%',
                            height: '20px'
                          }}
                        placeholder="11000"
                      />
                      {errors.postalCode && <p style={styles.error}>{errors.postalCode.message}</p>}
                    </div>
                    <div>
                      <label style={styles.label}>Calle</label>
                      <AnimatedInput
                        {...register("street")}
                        style={{ 
                            width: '70%',
                            height: '20px'
                          }}
                        placeholder="Calle"
                      />
                      {errors.street && <p style={styles.error}>{errors.street.message}</p>}
                    </div>
                    <div>
                      <label style={styles.label}>Número</label>
                      <AnimatedInput
                        {...register("number")}
                        style={{ 
                            width: '70%',
                            height: '20px'
                          }}
                        placeholder="1234"
                      />
                      {errors.number && <p style={styles.error}>{errors.number.message}</p>}
                    </div>
                  </div>

                  {/* Apartamento */}
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Apartamento (opcional)</label>
                    <AnimatedInput
                      {...register("apartment")}
                      style={{ 
                            width: '90%',
                            height: '20px'
                          }}
                      placeholder="Apt 5B"
                    />
                  </div>
                </div>
              )}

              {/* PASO 3: Tipo de Cuenta, Foto de Perfil y Términos */}
              {currentStep === 3 && (
                <div>
                  {/* Selector de Tipo de Cuenta */}
                  <div style={{ ...styles.fieldGroup, marginBottom: '3px' }}>
                    <label style={styles.label}>Tipo de cuenta</label>
                    <div style={styles.twoCols}>
                      <label style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '15px',
                        borderRadius: '10px',
                        border: selectedRole === "client" ? '2px solid #3B82F6' : '2px solid #E5E7EB',
                        backgroundColor: selectedRole === "client" ? '#EFF6FF' : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: selectedRole === "client" ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
                        transform: selectedRole === "client" ? 'translateY(-2px)' : 'translateY(0)'
                      }}>
                        <input
                          type="radio"
                          value="client"
                          {...register("role")}
                          style={{ display: 'none' }}
                        />
                        <FiUser style={{
                          width: '24px',
                          height: '24px',
                          color: selectedRole === "client" ? '#2563EB' : '#9CA3AF',
                          marginBottom: '6px'
                        }} />
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: selectedRole === "client" ? '#1E3A8A' : '#6B7280'
                        }}>
                          Usuario
                        </span>
                      </label>
                      
                      <label style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '15px',
                        borderRadius: '10px',
                        border: selectedRole === "provider" ? '2px solid #3B82F6' : '2px solid #E5E7EB',
                        backgroundColor: selectedRole === "provider" ? '#EFF6FF' : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: selectedRole === "provider" ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
                        transform: selectedRole === "provider" ? 'translateY(-2px)' : 'translateY(0)'
                      }}>
                        <input
                          type="radio"
                          value="provider"
                          {...register("role")}
                          style={{ display: 'none' }}
                        />
                        <FiShield style={{
                          width: '24px',
                          height: '24px',
                          color: selectedRole === "provider" ? '#2563EB' : '#9CA3AF',
                          marginBottom: '6px'
                        }} />
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: selectedRole === "provider" ? '#1E3A8A' : '#6B7280'
                        }}>
                          Proveedor
                        </span>
                      </label>
                    </div>
                    {errors.role && <p style={styles.error}>{errors.role.message}</p>}
                  </div>

                  {/* Foto de Perfil */}
                  <div style={{
                    textAlign: 'center',
                    marginBottom: '24px'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '6px'
                    }}>
                      Foto de perfil
                    </h3>
                    <p style={{
                      color: '#6B7280',
                      fontSize: '13px',
                      marginBottom: '20px'
                    }}>
                      Agregá una foto para personalizar tu perfil (opcional)
                    </p>
                    
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '16px'
                    }}>
                      {/* Preview de imagen */}
                      <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        border: '3px dashed #D1D5DB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#F9FAFB',
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <FiCamera size={32} color="#9CA3AF" />
                        )}
                      </div>
                      
                      {/* Botones */}
                      <div style={{
                        display: 'flex',
                        gap: '12px'
                      }}>
                        <label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                          />
                          <AnimatedButton type="button" variant="outline">
                            <FiCamera style={{ marginRight: '8px' }} />
                            Subir foto
                          </AnimatedButton>
                        </label>
                        
                        {imagePreview && (
                          <AnimatedButton 
                            type="button" 
                            variant="ghost"
                            onClick={() => {
                              setImagePreview(null);
                              setProfileImage(null);
                            }}
                          >
                            <FiSkipForward style={{ marginRight: '8px' }} />
                            Omitir
                          </AnimatedButton>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Términos y Condiciones */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    marginBottom: '20px',
                    padding: '14px',
                    backgroundColor: '#F9FAFB',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB'
                  }}>
                    <input
                      type="checkbox"
                      {...register("acceptTerms")}
                      style={{
                        marginTop: '2px',
                        width: '16px',
                        height: '16px',
                        accentColor: '#3B82F6'
                      }}
                    />
                    <label style={{
                      fontSize: '13px',
                      color: '#374151',
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
                </div>
              )}

              {/* Botones de navegación */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                marginTop: '20px'
              }}>
                <AnimatedButton
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  style={{ 
                    minWidth: '90px',
                    height: '36px',
                    fontSize: '12px',
                    padding: '8px 16px'
                  }}
                >
                  Anterior
                </AnimatedButton>

                {currentStep < 3 ? (
                  <AnimatedButton
                    type="button"
                    onClick={nextStep}
                    style={{ 
                      minWidth: '90px',
                      height: '36px',
                      fontSize: '12px',
                      padding: '8px 16px'
                    }}
                  >
                    Siguiente
                  </AnimatedButton>
                ) : (
                  <AnimatedButton
                    type="submit"
                    disabled={loading}
                    style={{ 
                      minWidth: '100px',
                      height: '36px',
                      fontSize: '12px',
                      padding: '8px 16px',
                      backgroundColor: loading ? '#9CA3AF' : '#3B82F6'
                    }}
                  >
                    {loading ? "Creando..." : "Crear cuenta"}
                  </AnimatedButton>
                )}
              </div>
            </form>
          </div>

          {/* Footer */}
          <div style={{
              textAlign: 'center',
              paddingTop: '3px',
              borderTop: '1px solid #E5E7EB',
              marginTop: '3px',
              paddingBottom: '16px'
            }}>
              <p style={{
                fontSize: '12px',
                color: '#6B7280',
                margin: 0
              }}>
                ¿Ya tenés cuenta?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  style={{
                    color: '#3B82F6',
                    background: 'none',
                    border: 'none',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '12px'
                  }}
                >
                  Iniciá sesión
                </button>
              </p>
            </div>
        </div>
      </div>
    </BeamsBackground>
  );
}
