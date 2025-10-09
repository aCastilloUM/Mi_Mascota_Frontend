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

// Esquema de validación
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
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número"),
    confirmPassword: z.string().min(1, "Confirmá tu contraseña"),
    acceptTerms: z.boolean().refine(val => val === true, "Debes aceptar los términos"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export default function RegisterForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
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

  const onSubmit = async (data) => {
    setError("");
    setLoading(true);
    
    try {
      const payload = {
        baseUser: {
          name: data.name,
          secondName: data.secondName,
          email: data.email.trim(),
          documentType: data.documentType,
          document: data.document,
          ubication: {
            department: data.department,
            city: data.city,
            postalCode: data.postalCode,
            street: data.street,
            number: data.number,
            apartment: data.apartment || null,
          },
          password: data.password,
        },
        [data.role]: data.role === "client" ? { birthDate: data.birthDate } : {},
      };
      
      await api.post("/auth/register", payload);
      navigate("/onboarding");
    } catch (e) {
      const msg = e?.response?.data?.error || e?.response?.data?.message || e?.message || "No pudimos crear tu cuenta";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = watch("role");

  return (
    <BeamsBackground style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '448px' }}>
        {/* Card Principal */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(4px)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            padding: '32px 32px 24px'
          }}>
            <img
              src={logoTop}
              alt="Mi Mascota"
              style={{ width: '64px', height: '64px' }}
            />
            <div style={{ textAlign: 'center', gap: '4px' }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#111827',
                margin: 0,
                marginBottom: '4px'
              }}>
                Crear cuenta
              </h2>
              <p style={{
                color: '#6B7280',
                fontSize: '14px',
                margin: 0
              }}>
                ¡Bienvenido! Creá tu cuenta para comenzar.
              </p>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '0 32px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {error && (
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#B91C1C',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            {/* Selector de Rol */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Tipo de cuenta</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px',
                  borderRadius: '12px',
                  border: selectedRole === "client" ? '2px solid #3B82F6' : '2px solid #E5E7EB',
                  backgroundColor: selectedRole === "client" ? '#EFF6FF' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                  <input
                    type="radio"
                    value="client"
                    {...register("role")}
                    style={{ display: 'none' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <FiUser style={{
                      width: '24px',
                      height: '24px',
                      color: selectedRole === "client" ? '#2563EB' : '#9CA3AF'
                    }} />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: selectedRole === "client" ? '#1E3A8A' : '#6B7280'
                    }}>
                      Usuario
                    </span>
                  </div>
                </label>
                
                <label style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px',
                  borderRadius: '12px',
                  border: selectedRole === "provider" ? '2px solid #3B82F6' : '2px solid #E5E7EB',
                  backgroundColor: selectedRole === "provider" ? '#EFF6FF' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                  <input
                    type="radio"
                    value="provider"
                    {...register("role")}
                    style={{ display: 'none' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <FiShield style={{
                      width: '24px',
                      height: '24px',
                      color: selectedRole === "provider" ? '#2563EB' : '#9CA3AF'
                    }} />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: selectedRole === "provider" ? '#1E3A8A' : '#6B7280'
                    }}>
                      Proveedor
                    </span>
                  </div>
                </label>
              </div>
              {errors.role && <p style={{ color: '#EF4444', fontSize: '12px', margin: 0 }}>{errors.role.message}</p>}
            </div>

            {/* Nombre y Apellido */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Nombre</label>
                <input
                  {...register("name")}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '8px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    fontSize: '14px'
                  }}
                  placeholder="Tu nombre"
                  onFocus={(e) => e.target.style.border = '2px solid #3B82F6'}
                  onBlur={(e) => e.target.style.border = '1px solid #D1D5DB'}
                />
                {errors.name && <p style={{ color: '#EF4444', fontSize: '12px', margin: 0 }}>{errors.name.message}</p>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Apellido</label>
                <input
                  {...register("secondName")}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '8px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    fontSize: '14px'
                  }}
                  placeholder="Tu apellido"
                  onFocus={(e) => e.target.style.border = '2px solid #3B82F6'}
                  onBlur={(e) => e.target.style.border = '1px solid #D1D5DB'}
                />
                {errors.secondName && <p style={{ color: '#EF4444', fontSize: '12px', margin: 0 }}>{errors.secondName.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                {...register("email")}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="tu@email.com"
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            {/* Documento */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tipo de documento</label>
                <select
                  {...register("documentType")}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="CI">Cédula de Identidad</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
                {errors.documentType && <p className="text-red-500 text-xs">{errors.documentType.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Número de documento</label>
                <input
                  {...register("document")}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="12345678"
                />
                {errors.document && <p className="text-red-500 text-xs">{errors.document.message}</p>}
              </div>
            </div>

            {/* Ubicación */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Departamento</label>
                <input
                  {...register("department")}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Montevideo"
                />
                {errors.department && <p className="text-red-500 text-xs">{errors.department.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Ciudad</label>
                <input
                  {...register("city")}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Ciudad"
                />
                {errors.city && <p className="text-red-500 text-xs">{errors.city.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Código Postal</label>
                <input
                  {...register("postalCode")}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="11000"
                />
                {errors.postalCode && <p className="text-red-500 text-xs">{errors.postalCode.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Calle</label>
                <input
                  {...register("street")}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="18 de Julio"
                />
                {errors.street && <p className="text-red-500 text-xs">{errors.street.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Número</label>
                <input
                  {...register("number")}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="1234"
                />
                {errors.number && <p className="text-red-500 text-xs">{errors.number.message}</p>}
              </div>
            </div>

            {/* Apartamento */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Apartamento (opcional)</label>
              <input
                {...register("apartment")}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Apt 5B"
              />
            </div>

            {/* Fecha de nacimiento */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Fecha de nacimiento</label>
              <input
                type="date"
                {...register("birthDate")}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              {errors.birthDate && <p className="text-red-500 text-xs">{errors.birthDate.message}</p>}
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="w-full h-10 px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            </div>

            {/* Confirmar Contraseña */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Confirmar contraseña</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  className="w-full h-10 px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Repetí tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}
            </div>

            {/* Términos y Condiciones */}
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                {...register("acceptTerms")}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-600">
                Acepto los{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Términos y Condiciones
                </a>{" "}
                y la{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Política de Privacidad
                </a>
              </label>
            </div>
            {errors.acceptTerms && <p className="text-red-500 text-xs">{errors.acceptTerms.message}</p>}

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
            </button>
          </form>

          {/* Footer */}
          <div className="border-t border-gray-200 py-4 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tenés cuenta?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:underline font-medium"
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