// src/pages/Register.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiEye, FiEyeOff } from "react-icons/fi";
import zxcvbn from "zxcvbn";

import bg1 from "../assets/backgrounds/background_blue.png";
import logoTop from "../assets/logos/dog+cat.png";
import { useAuth } from "../context/AuthContext";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Select from "react-select";
// Estilos personalizados para react-datepicker
const datepickerCustomStyles = {
  input: {
    width: "100%",
    height: 46,
    borderRadius: 30,
    border: "1px solid rgba(0,0,0,0.16)",
    background: "#fff",
    color: "#0A0F1E",
    outline: "none",
    padding: "12px 16px",
    fontSize: 14,
    fontFamily: "'Segoe UI Rounded','Arial Rounded MT Bold',Arial,sans-serif'",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  calendar: {
    borderRadius: 24,
    boxShadow: "0 8px 28px rgba(0,0,0,0.15)",
    fontFamily: "'Segoe UI Rounded','Arial Rounded MT Bold',Arial,sans-serif'",
    fontSize: 14,
    padding: 8,
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.10)",
  },
};
import { api } from "../lib/api";

const rounded = "'Segoe UI Rounded','Arial Rounded MT Bold',Arial,sans-serif'";

// límites para la fecha de nacimiento (>= 16 años)
const MIN_DOB_ISO = "1900-01-01";
const maxDob = new Date();
maxDob.setFullYear(maxDob.getFullYear() - 16);
const MAX_DOB_ISO = maxDob.toISOString().slice(0, 10);

// Reglas de password
const strongPassword = z
  .string()
  .min(10, "Mínimo 10 caracteres")
  .refine((v) => /[A-Z]/.test(v), "Agregá al menos 1 mayúscula")
  .refine((v) => /[a-z]/.test(v), "Agregá al menos 1 minúscula")
  .refine((v) => /[0-9]/.test(v), "Agregá al menos 1 número")
  .refine((v) => /[^A-Za-z0-9]/.test(v), "Agregá al menos 1 símbolo")
  .refine((v) => !/\s/.test(v), "No uses espacios");

const schema = z
  .object({
    name: z.string().trim().min(1, "Requerido"),
    secondName: z.string().trim().min(1, "Requerido"),
    email: z.string().email("Ingresá un correo válido"),
    documentType: z.enum(["CI", "Pasaporte"], { errorMap: () => ({ message: "Elegí un tipo" }) }),
    document: z.string().trim().min(6, "Mín. 6 caracteres"),
    department: z.string().trim().min(1, "Requerido"), // 👈 departamento
    city: z.string().trim().min(1, "Requerido"),
    postalCode: z.string().trim().min(1, "Requerido"),
    street: z.string().trim().min(1, "Requerido"),
    number: z.string().trim().min(1, "Requerido"),
    apartment: z.string().trim().optional(),
    birthDate: z
      .string()
      .min(1, "Requerido")
      .refine((v) => {
        const d = new Date(v);
        const now = new Date();
        const min = new Date(MIN_DOB_ISO);
        const max = new Date(MAX_DOB_ISO);
        const age =
          now.getFullYear() - d.getFullYear() -
          (now < new Date(now.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0);
        return d >= min && d <= max && age >= 16;
      }, "Debés ser mayor de 16 años"),
    password: strongPassword,
    confirm: z.string().min(1, "Repetí la contraseña"),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Las contraseñas no coinciden" })
  .refine(
    (d) => {
      const pw = d.password.toLowerCase();
      const emailUser = d.email.split("@")[0]?.toLowerCase() || "";
      return (
        !pw.includes(d.name.toLowerCase()) &&
        !pw.includes(d.secondName.toLowerCase()) &&
        !pw.includes(emailUser) &&
        !pw.includes(String(d.document).toLowerCase())
      );
    },
  { path: ["password"], message: "Recuerda no usar tu nombre, mail o documento en la contraseña" }
  );

export default function Register() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const next = params.get("next") || "/";

  const { login, isAuth } = useAuth();

  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [pwScore, setPwScore] = useState(0);
  const [pwFeedback, setPwFeedback] = useState({ warning: "", suggestions: [] });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    watch,
    setValue,
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      secondName: "",
      email: "",
      documentType: "CI",
      document: "",
      department: "",      // 👈 agregado para que quede prolijo
      city: "",
      postalCode: "",
      street: "",
      number: "",
      apartment: "",
      birthDate: "",
      password: "",
      confirm: "",
    },
  });

  useEffect(() => {
    if (isAuth) navigate(next, { replace: true });
  }, [isAuth, next, navigate]);

  const onSubmit = async (data) => {
    setErr("");
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
            department: data.department, // 👈 department en la ubicación
            city: data.city,
            postalCode: data.postalCode,
            street: data.street,
            number: data.number,
            apartment: data.apartment || null,
          },
          password: data.password,
        },
        client: { birthDate: data.birthDate },
      };
      await api.post("/auth/register", payload);
      await login({ email: data.email.trim(), password: data.password });
    } catch (e) {
      const msg = e?.response?.data?.error || e?.response?.data?.message || e?.message || "No pudimos crear tu cuenta";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    register("password").onChange(e);
    const value = e.target.value || "";
    const probe = zxcvbn(value, [
      watch("email") || "",
      watch("name") || "",
      watch("secondName") || "",
      watch("document") || "",
    ]);
    // Requisitos personalizados
    const hasLength = value.length >= 10;
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSymbol = /[^A-Za-z0-9]/.test(value);
    let score = probe.score;
    // Medidor personalizado: 'Muy fuerte' solo si cumple todos los requisitos
    const requirementsMet = [hasLength, hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;
    if (requirementsMet === 5) {
      score = 4; // Muy fuerte
    } else if (requirementsMet === 4) {
      score = 3; // Fuerte
    } else if (requirementsMet === 3) {
      score = 2; // Aceptable
    } else if (requirementsMet === 2) {
      score = 1; // Débil
    } else {
      score = 0; // Muy débil
    }
    setPwScore(score);
    setPwFeedback({ warning: probe.feedback.warning, suggestions: probe.feedback.suggestions || [] });
  };

  return (
    <div style={sx.screen}>
      <img src={bg1} alt="bg" style={sx.bg} />

      {/* Cerrar (arriba-derecha) */}
      <button aria-label="Cerrar" onClick={() => navigate(-1)} style={sx.closeBtn}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 5L13 13M13 5L5 13" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Contenedor fijo y centrado; sin scroll lateral */}
      <div style={sx.centerWrap}>
        <div style={sx.logoWrap}>
          <img src={logoTop} alt="Mi Mascota" style={sx.logoImg} />
        </div>

        {/* CARD: layout column con body scrollable y footer sticky */}
        <div style={sx.card}>
          {/* HEADER dentro del card */}
          <div style={sx.cardHeader}>
            <h1 style={sx.title}>Crear cuenta</h1>
            <p style={sx.subtitle}>Completá tus datos para registrarte.</p>
          </div>

          {/* BODY SCROLLEABLE (solo se mueve esto) */}
          <div style={sx.cardBody}>
            <form id="registerForm" onSubmit={handleSubmit(onSubmit)} style={sx.form}>
              {/* Nombres */}
              <div style={sx.row2}>
                <div style={sx.field}>
                  <label htmlFor="name" style={sx.label}>Nombre</label>
                  <input
                    id="name"
                    type="text"
                    {...register("name")}
                    style={{ ...sx.input, ...(errors.name ? sx.inputError : touchedFields.name ? sx.inputOk : null) }}
                  />
                  {errors.name && <span style={sx.error}>{errors.name.message}</span>}
                </div>
                <div style={sx.field}>
                  <label htmlFor="secondName" style={sx.label}>Apellido</label>
                  <input
                    id="secondName"
                    type="text"
                    {...register("secondName")}
                    style={{ ...sx.input, ...(errors.secondName ? sx.inputError : touchedFields.secondName ? sx.inputOk : null) }}
                  />
                  {errors.secondName && <span style={sx.error}>{errors.secondName.message}</span>}
                </div>
              </div>

              {/* Email */}
              <div style={sx.field}>
                <label htmlFor="email" style={sx.label}>Mail</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  {...register("email")}
                  style={{ ...sx.input, ...(errors.email ? sx.inputError : touchedFields.email ? sx.inputOk : null) }}
                />
                {errors.email && <span style={sx.error}>{errors.email.message}</span>}
              </div>

              {/* Documento */}
              <div style={sx.row2}>
                <div style={sx.field}>
                  <label htmlFor="documentType" style={sx.label}>Tipo de documento</label>
                  <Select
                    id="documentType"
                    options={[{ value: "CI", label: "CI" }, { value: "Pasaporte", label: "Pasaporte" }]}
                    value={(() => {
                      const val = watch("documentType");
                      return val ? { value: val, label: val } : null;
                    })()}
                    onChange={opt => {
                      setValue("documentType", opt.value, { shouldValidate: true });
                    }}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        borderRadius: 30,
                        minHeight: 46,
                        height: 46,
                        fontSize: 14,
                        fontFamily: "'Segoe UI Rounded','Arial Rounded MT Bold',Arial,sans-serif'",
                        boxShadow: state.isFocused ? "0 0 0 2px #a0ceeb55" : "none",
                        borderColor: state.isFocused ? "#a0ceeb" : "rgba(0,0,0,0.16)",
                        paddingLeft: 16,
                        paddingRight: 16,
                        background: "#fff",
                        color: "#0A0F1E",
                        outline: "none",
                        cursor: "pointer",
                        width: "100%",
                      }),
                      option: (base, state) => ({
                        ...base,
                        fontSize: 14,
                        padding: "8px 16px",
                        backgroundColor: state.isSelected ? "#eaf6ff" : state.isFocused ? "#f2f8fc" : "#fff",
                        color: "#0A0F1E",
                        cursor: "pointer",
                      }),
                      menu: base => ({
                        ...base,
                        borderRadius: 16,
                        boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
                        fontSize: 14,
                        marginTop: 2,
                      }),
                      singleValue: base => ({ ...base, fontSize: 14, color: "#0A0F1E" }),
                      dropdownIndicator: base => ({ ...base, color: "#a0ceeb" }),
                    }}
                  />
                  {errors.documentType && <span style={sx.error}>{errors.documentType.message}</span>}
                </div>
                <div style={sx.field}>
                  <label htmlFor="document" style={sx.label}>N° documento</label>
                  <input
                    id="document"
                    type="text"
                    inputMode="numeric"
                    {...register("document")}
                    style={{ ...sx.input, ...(errors.document ? sx.inputError : touchedFields.document ? sx.inputOk : null) }}
                  />
                  {errors.document && <span style={sx.error}>{errors.document.message}</span>}
                </div>
                <div style={sx.field}>
                  <label htmlFor="department" style={sx.label}>Departamento</label>
                  <input
                    id="department"
                    type="text"
                    {...register("department")}
                    style={{ ...sx.input, ...(errors.department ? sx.inputError : touchedFields.department ? sx.inputOk : null) }}
                  />
                  {errors.department && <span style={sx.error}>{errors.department.message}</span>}
                </div>
                <div style={sx.field}>
                  <label htmlFor="city" style={sx.label}>Ciudad</label>
                  <input
                    id="city"
                    type="text"
                    {...register("city")}
                    style={{ ...sx.input, ...(errors.city ? sx.inputError : touchedFields.city ? sx.inputOk : null) }}
                  />
                  {errors.city && <span style={sx.error}>{errors.city.message}</span>}
                </div>
              </div>

              <div style={sx.row2}>
                <div style={sx.field}>
                  <label htmlFor="postalCode" style={sx.label}>Código postal</label>
                  <input
                    id="postalCode"
                    type="text"
                    inputMode="numeric"
                    {...register("postalCode")}
                    style={{ ...sx.input, ...(errors.postalCode ? sx.inputError : touchedFields.postalCode ? sx.inputOk : null) }}
                  />
                  {errors.postalCode && <span style={sx.error}>{errors.postalCode.message}</span>}
                </div>
                <div style={sx.field}>
                  <label htmlFor="number" style={sx.label}>N° puerta</label>
                  <input
                    id="number"
                    type="text"
                    inputMode="numeric"
                    {...register("number")}
                    style={{ ...sx.input, ...(errors.number ? sx.inputError : touchedFields.number ? sx.inputOk : null) }}
                  />
                  {errors.number && <span style={sx.error}>{errors.number.message}</span>}
                </div>
              </div>

              <div style={sx.field}>
                <label htmlFor="street" style={sx.label}>Calle</label>
                <input
                  id="street"
                  type="text"
                  {...register("street")}
                  style={{ ...sx.input, ...(errors.street ? sx.inputError : touchedFields.street ? sx.inputOk : null) }}
                />
                {errors.street && <span style={sx.error}>{errors.street.message}</span>}
              </div>

              <div style={sx.field}>
                <label htmlFor="apartment" style={sx.label}>Piso / Depto (opcional)</label>
                <input id="apartment" type="text" placeholder="Ej: 3B" {...register("apartment")} style={sx.input} />
              </div>

              {/* Nacimiento */}
              <div style={sx.field}>
  <label htmlFor="birthDate" style={sx.label}>Fecha de nacimiento</label>
  <LocalizationProvider dateAdapter={AdapterDateFns}>
  <MuiDatePicker
    value={watch("birthDate") ? new Date(watch("birthDate").split('/').reverse().join('-')) : null}
    onChange={date => {
      if (date) {
        const d = new Date(date);
        const formatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth()+1).padStart(2, '0')}/${d.getFullYear()}`;
        setValue("birthDate", formatted, { shouldValidate: true });
      } else {
        setValue("birthDate", "", { shouldValidate: true });
      }
    }}
    minDate={new Date(MIN_DOB_ISO)}
    maxDate={new Date(MAX_DOB_ISO)}
    format="dd/MM/yyyy"
    slotProps={{
      textField: {
        placeholder: "Selecciona tu fecha de nacimiento",
        fullWidth: true,
        variant: "outlined",
        InputProps: {
          style: {
            borderRadius: 30,
            height: 46,
            fontFamily: "'Segoe UI Rounded','Arial Rounded MT Bold',Arial,sans-serif'",
            fontSize: 14,
            color: "#0A0F1E",
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.16)",
            outline: "none",
            padding: "12px 16px",
            boxSizing: "border-box",
            transition: "border-color 0.2s",
          },
          autoComplete: "off",
          name: "mui-birthdate"
        },
        error: !!errors.birthDate,
        helperText: errors.birthDate?.message || ""
      }
    }}
  />
</LocalizationProvider>
</div>

              {/* Password */}
              <div style={sx.field}>
                <label htmlFor="password" style={sx.label}>Contraseña</label>
                <div style={sx.pwdWrap}>
                  <input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    {...register("password")}
                    onChange={handlePasswordChange}
                    style={{ ...sx.input, paddingRight: 44, ...(errors.password ? sx.inputError : touchedFields.password ? sx.inputOk : null) }}
                  />
                  <button type="button" onClick={() => setShowPwd((s) => !s)} style={sx.eyeBtn} aria-label={showPwd ? "Ocultar" : "Mostrar"}>
                    {showPwd ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                {errors.password && <span style={sx.error}>{errors.password.message}</span>}

                {/* Medidor */}
                <div style={sx.pwMeterWrap}>
                  <div style={{ ...sx.pwBar, ...sx.pwBarLevel[pwScore] }} />
                  <div style={sx.pwHints}>
                    <span style={sx.pwLabel[pwScore]}>
                      {["Muy débil","Débil","Aceptable","Fuerte","Muy fuerte"][pwScore]}
                    </span>
                    {pwFeedback.warning ? <span style={sx.pwWarn}>· {pwFeedback.warning}</span> : null}
                  </div>
                  <ul style={sx.pwChecklist}>
                    <li style={/.{10,}/.test(watch("password")||"") ? sx.ok : sx.bad}>≥ 10 caracteres</li>
                    <li style={/[A-Z]/.test(watch("password")||"") ? sx.ok : sx.bad}>1 mayúscula</li>
                    <li style={/[a-z]/.test(watch("password")||"") ? sx.ok : sx.bad}>1 minúscula</li>
                    <li style={/[0-9]/.test(watch("password")||"") ? sx.ok : sx.bad}>1 número</li>
                    <li style={/[^A-Za-z0-9]/.test(watch("password")||"") ? sx.ok : sx.bad}>1 símbolo</li>
                  </ul>
                </div>
              </div>

              {/* Confirm */}
              <div style={sx.field}>
                <label htmlFor="confirm" style={sx.label}>Repetir contraseña</label>
                <div style={sx.pwdWrap}>
                  <input
                    id="confirm"
                    type={showPwd2 ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    {...register("confirm")}
                    style={{ ...sx.input, paddingRight: 44, ...(errors.confirm ? sx.inputError : touchedFields.confirm ? sx.inputOk : null) }}
                  />
                  <button type="button" onClick={() => setShowPwd2((s) => !s)} style={sx.eyeBtn} aria-label={showPwd2 ? "Ocultar" : "Mostrar"}>
                    {showPwd2 ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                {errors.confirm && <span style={sx.error}>{errors.confirm.message}</span>}
              </div>

              {/* Error global */}
              {err ? <div style={sx.alert}>{err}</div> : null}
            </form>
          </div>

          {/* FOOTER STICKY */}
          <div style={sx.cardFooter}>
            <button
              form="registerForm"
              type="submit"
              disabled={!isValid || loading || pwScore < 3}
              style={{ ...sx.primaryBtn, ...(!isValid || loading || pwScore < 3 ? sx.primaryBtnDisabled : null) }}
            >
              {loading ? "Creando cuenta…" : "Crear cuenta"}
            </button>

            <button type="button" onClick={() => navigate(`/login?next=${encodeURIComponent(next)}`)} style={sx.secondaryBtn}>
              ¿Ya tenés cuenta? Iniciar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- estilos ---- */
const sx = {
  screen: {
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100vh",
    touchAction: "pan-y",
    fontFamily: "'Segoe UI Rounded','Arial Rounded MT Bold',Arial,sans-serif",
    color: "#0A0F1E",
    overflowX: "hidden",
    overflowY: "auto",
  },
  bg: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 },

  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 3,
    width: 38,
    height: 38,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(14, 20, 42, 0.55)",
    backdropFilter: "blur(6px)",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    color: "#fff",
  },

  centerWrap: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: "90px 16px 24px",
    boxSizing: "border-box",
    overflow: "hidden",
  },

  logoWrap: { position: "relative", zIndex: 2, marginBottom: -36, display: "grid", placeItems: "center", width: "100%" },
  logoImg: { width: 130, height: 130, objectFit: "contain", filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.35))" },

  card: {
    position: "relative",
    width: "min(520px, calc(100vw - 32px))",
    maxHeight: "calc(100vh - 120px)",
    display: "flex",
    flexDirection: "column",
    margin: "0 auto",
    borderRadius: 20,
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(255,255,255,0.25)",
    boxShadow: "0 8px 28px rgba(0,0,0,0.25)",
    backdropFilter: "blur(10px)",
    overflow: "hidden",
  },
  cardHeader: { padding: 18, paddingBottom: 0 },
  cardBody: {
    padding: 18,
    paddingTop: 12,
    overflowY: "auto",
    overflowX: "hidden",
    overscrollBehavior: "contain",
    WebkitOverflowScrolling: "touch",
    flex: 1,
  },
  cardFooter: {
    position: "sticky",
    bottom: 0,
    padding: 14,
    display: "grid",
    gap: 8,
    background: "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.92) 40%)",
    backdropFilter: "blur(6px)",
    borderTop: "1px solid rgba(0,0,0,0.06)",
  },

  title: { margin: 0, fontSize: "clamp(18px, 4.1vw, 20px)", lineHeight: 1.35, fontWeight: 700 },
  subtitle: { margin: "8px 0 12px", fontSize: 14, opacity: 0.85 },

  form: { display: "grid", gap: 12 },
  row2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 },
  field: { display: "grid", gap: 6 },
  label: { fontSize: 13, opacity: 0.9 },

  input: {
    width: "100%", height: 46, boxSizing: "border-box",
    borderRadius: 30, border: "1px solid rgba(0,0,0,0.16)",
    background: "#fff", color: "#0A0F1E", outline: "none",
    padding: "12px 16px", fontSize: 14,
  },
  select: {
    appearance: "none", WebkitAppearance: "none", MozAppearance: "none",
    borderRadius: 30,
    height: 46,
    fontFamily: "'Segoe UI Rounded','Arial Rounded MT Bold',Arial,sans-serif'",
    fontSize: 14,
    color: "#0A0F1E",
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.16)",
    outline: "none",
    padding: "12px 16px",
    boxSizing: "border-box",
    backgroundImage:
      "linear-gradient(45deg, transparent 50%, #6b778c 50%), linear-gradient(135deg, #6b778c 50%, transparent 50%)",
    backgroundPosition: "calc(100% - 18px) calc(1em + 2px), calc(100% - 13px) calc(1em + 2px)",
    backgroundSize: "5px 5px, 5px 5px",
    backgroundRepeat: "no-repeat",
    paddingRight: 40,
  },
  inputOk: { border: "1px solid rgba(100, 200, 120, 0.55)" },
  inputError: { border: "1px solid rgba(255, 85, 85, 0.65)" },

  pwdWrap: { position: "relative", display: "flex", alignItems: "center" },
  eyeBtn: { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: "#333", cursor: "pointer", padding: 4, lineHeight: 1 },

  error: { color: "#a60000", fontSize: 12, marginTop: 2 },
  alert: { background: "rgba(255, 87, 87, 0.15)", border: "1px solid rgba(255, 87, 87, 0.4)", color: "#a60000", borderRadius: 12, padding: "10px 12px", fontSize: 13 },

  primaryBtn: { width: "100%", border: "none", borderRadius: 16, padding: "14px 16px", fontSize: 16, fontWeight: 700, cursor: "pointer", color: "#fff", background: "#0389ffff" },
  primaryBtnDisabled: { opacity: 0.6 },
  secondaryBtn: { width: "100%", border: "1px solid rgba(0,0,0,0.15)", background: "rgba(255,255,255,0.7)", color: "#0A0F1E", padding: "12px 16px", borderRadius: 14, fontWeight: 700, cursor: "pointer" },

  /* Medidor de contraseña */
  pwMeterWrap: { marginTop: 6 },
  pwBar: { height: 8, borderRadius: 8, background: "#e5e7eb", overflow: "hidden" },
  pwBarLevel: {
    0: { background: "linear-gradient(90deg, #ff4d4f 20%, #e5e7eb 20%)" },
    1: { background: "linear-gradient(90deg, #ff7a45 40%, #e5e7eb 40%)" },
    2: { background: "linear-gradient(90deg, #fadb14 60%, #e5e7eb 60%)" },
    3: { background: "linear-gradient(90deg, #52c41a 80%, #e5e7eb 80%)" },
    4: { background: "linear-gradient(90deg, #389e0d 100%, #e5e7eb 0%)" },
  },
  pwHints: { marginTop: 6, fontSize: 12, display: "flex", gap: 6, alignItems: "baseline" },
  pwWarn: { color: "#a60000" },
  pwLabel: {
    0: { color: "#ff4d4f", fontWeight: 700 },
    1: { color: "#ff7a45", fontWeight: 700 },
    2: { color: "#d4b106", fontWeight: 700 },
    3: { color: "#52c41a", fontWeight: 700 },
    4: { color: "#389e0d", fontWeight: 700 },
  },
  pwChecklist: { margin: "6px 0 0", paddingLeft: 16, display: "grid", gap: 2, fontSize: 12 },
  ok: { color: "#2f7a1f" },
  bad: { color: "#a60000" },
};
