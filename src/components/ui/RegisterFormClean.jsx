import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiEye, FiEyeOff, FiUser, FiShield } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { BeamsBackground } from "./BeamsBackground";
import logoTop from "../../assets/logos/dog+cat.png";

// Esquema de validación simplificado
const schema = z
  .object({
    name: z.string().trim().min(1, "El nombre es requerido"),
    secondName: z.string().trim().min(1, "El apellido es requerido"),
    email: z.string().email("Ingresá un correo válido"),
    role: z.enum(["client", "provider"], { errorMap: () => ({ message: "Elegí un rol" }) }),
    documentType: z.enum(["CI", "Pasaporte"], { errorMap: () => ({ message: "Elegí un tipo" }) }),
    document: z.string().trim().min(6, "Mín. 6 caracteres"),
    department: z.string().trim().min(1, "Requerido"),
    city: z.string().trim().min(1, "Requerido"),
    postalCode: z.string().trim().min(1, "Requerido"),
    street: z.string().trim().min(1, "Requerido"),
    number: z.string().trim().min(1, "Requerido"),
    apartment: z.string().trim().optional(),
    birthDate: z.string().min(1, "Requerido"),
    password: z
      .string()
      .min(10, "Minimo 10 caracteres")
      .regex(/[A-Z]/, "Agrega al menos 1 mayuscula")
      .regex(/[a-z]/, "Agrega al menos 1 minuscula")
      .regex(/[0-9]/, "Agrega al menos 1 numero")
      .regex(/[^A-Za-z0-9]/, "Agrega al menos 1 simbolo")
      .refine((value) => !/\s/.test(value), { message: "No uses espacios" }),
    confirmPassword: z.string().min(1, "Confirmá tu contraseña"),
    acceptTerms: z.boolean().refine(val => val === true, "Debes aceptar los términos"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// Estilos reutilizables
const styles = {
  input: {
    width: '100%',
    height: '40px',
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    outline: 'none',
    fontSize: '14px',
    backgroundColor: '#FFFFFF'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '4px',
    display: 'block'
  },
  error: {
    color: '#EF4444',
    fontSize: '12px',
    margin: '4px 0 0 0'
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px'
  }
};

export default function RegisterForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      role: "client",
      documentType: "CI",
    },
  });

  const selectedRole = watch("role");

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
  return (
    <BeamsBackground>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
        zIndex: 10
      }}>
        <div style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          overflow: 'hidden',
          margin: '16px 0'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            padding: '32px 32px 24px'
          }}>
            <img
              src={logoTop}
              alt="Mi Mascota"
              style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 16px'
              }}
            />
            <h2 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#111827',
              margin: '0 0 8px 0'
            }}>
              Crear cuenta
            </h2>
            <p style={{
              color: '#6B7280',
              fontSize: '16px',
              margin: 0
            }}>
              ¡Bienvenido! Creá tu cuenta para comenzar.
            </p>
          </div>

          {/* Formulario */}
          <div style={{ padding: '0 32px 32px' }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <div style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#B91C1C',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginBottom: '16px'
                }}>
                  {error}
                </div>
              )}

              {/* Selector de Rol */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Tipo de cuenta</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px'
                }}>
                  <label style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '16px',
                    borderRadius: '12px',
                    border: selectedRole === "client" ? '2px solid #3B82F6' : '2px solid #E5E7EB',
                    backgroundColor: selectedRole === "client" ? '#EFF6FF' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
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
                      marginBottom: '8px'
                    }} />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: selectedRole === "client" ? '#1E3A8A' : '#6B7280'
                    }}>
                      Usuario
                    </span>
                  </label>
                  
                  <label style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '16px',
                    borderRadius: '12px',
                    border: selectedRole === "provider" ? '2px solid #3B82F6' : '2px solid #E5E7EB',
                    backgroundColor: selectedRole === "provider" ? '#EFF6FF' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
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
                      marginBottom: '8px'
                    }} />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: selectedRole === "provider" ? '#1E3A8A' : '#6B7280'
                    }}>
                      Proveedor
                    </span>
                  </label>
                </div>
                {errors.role && <p style={styles.error}>{errors.role.message}</p>}
              </div>

              {/* Nombre y Apellido */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div>
                  <label style={styles.label}>Nombre</label>
                  <input
                    {...register("name")}
                    style={styles.input}
                    placeholder="Tu nombre"
                  />
                  {errors.name && <p style={styles.error}>{errors.name.message}</p>}
                </div>
                <div>
                  <label style={styles.label}>Apellido</label>
                  <input
                    {...register("secondName")}
                    style={styles.input}
                    placeholder="Tu apellido"
                  />
                  {errors.secondName && <p style={styles.error}>{errors.secondName.message}</p>}
                </div>
              </div>

              {/* Email */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  {...register("email")}
                  style={styles.input}
                  placeholder="tu@email.com"
                />
                {errors.email && <p style={styles.error}>{errors.email.message}</p>}
              </div>

              {/* Documento */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div>
                  <label style={styles.label}>Tipo de documento</label>
                  <select
                    {...register("documentType")}
                    style={styles.input}
                  >
                    <option value="CI">Cédula de Identidad</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                  {errors.documentType && <p style={styles.error}>{errors.documentType.message}</p>}
                </div>
                <div>
                  <label style={styles.label}>Número</label>
                  <input
                    {...register("document")}
                    style={styles.input}
                    placeholder="12345678"
                  />
                  {errors.document && <p style={styles.error}>{errors.document.message}</p>}
                </div>
              </div>

              {/* Ubicación */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div>
                  <label style={styles.label}>Departamento</label>
                  <input
                    {...register("department")}
                    style={styles.input}
                    placeholder="Montevideo"
                  />
                  {errors.department && <p style={styles.error}>{errors.department.message}</p>}
                </div>
                <div>
                  <label style={styles.label}>Ciudad</label>
                  <input
                    {...register("city")}
                    style={styles.input}
                    placeholder="Ciudad"
                  />
                  {errors.city && <p style={styles.error}>{errors.city.message}</p>}
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div>
                  <label style={styles.label}>C. Postal</label>
                  <input
                    {...register("postalCode")}
                    style={styles.input}
                    placeholder="11000"
                  />
                  {errors.postalCode && <p style={styles.error}>{errors.postalCode.message}</p>}
                </div>
                <div>
                  <label style={styles.label}>Calle</label>
                  <input
                    {...register("street")}
                    style={styles.input}
                    placeholder="18 de Julio"
                  />
                  {errors.street && <p style={styles.error}>{errors.street.message}</p>}
                </div>
                <div>
                  <label style={styles.label}>Número</label>
                  <input
                    {...register("number")}
                    style={styles.input}
                    placeholder="1234"
                  />
                  {errors.number && <p style={styles.error}>{errors.number.message}</p>}
                </div>
              </div>

              {/* Apartamento */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Apartamento (opcional)</label>
                <input
                  {...register("apartment")}
                  style={styles.input}
                  placeholder="Apt 5B"
                />
              </div>

              {/* Fecha de nacimiento */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Fecha de nacimiento</label>
                <input
                  type="date"
                  {...register("birthDate")}
                  style={styles.input}
                />
                {errors.birthDate && <p style={styles.error}>{errors.birthDate.message}</p>}
              </div>

              {/* Contraseña */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    style={{
                      ...styles.input,
                      paddingRight: '40px'
                    }}
                    placeholder="Tu contraseña"
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
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {errors.password && <p style={styles.error}>{errors.password.message}</p>}
              </div>

              {/* Confirmar Contraseña */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Confirmar contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    style={{
                      ...styles.input,
                      paddingRight: '40px'
                    }}
                    placeholder="Repetí tu contraseña"
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
                    {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <p style={styles.error}>{errors.confirmPassword.message}</p>}
              </div>

              {/* Términos */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                marginBottom: '24px'
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
                  fontSize: '14px',
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

              {/* Botón Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: loading ? '#9CA3AF' : 'linear-gradient(to right, #3B82F6, #2563EB)',
                  color: '#FFFFFF',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '16px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  marginBottom: '16px'
                }}
              >
                {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
              </button>
            </form>

            {/* Footer */}
            <div style={{
              textAlign: 'center',
              paddingTop: '16px',
              borderTop: '1px solid #E5E7EB'
            }}>
              <p style={{
                fontSize: '14px',
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
                    fontWeight: '500'
                  }}
                >
                  Iniciá sesión
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </BeamsBackground>
  );
}
