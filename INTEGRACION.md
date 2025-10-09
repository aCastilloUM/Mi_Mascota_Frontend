# Integración Frontend-Backend

## 🔧 Configuración Completada

### ✅ **APIs Implementadas**
- **Login**: `POST /auth/login` - Autenticación de usuarios
- **Register**: `POST /auth/register` - Registro de nuevos usuarios  
- **Create Profile**: `POST /profiles` - Creación/actualización de perfiles
- **Upload Photo**: `POST /profiles/upload-photo` - Subida de fotos de perfil

### ✅ **Funcionalidades Frontend**
- **Login.jsx**: Conectado con manejo de errores específicos
- **Register.jsx**: Flujo completo de registro con perfil y foto
- **AuthContext**: Manejo de tokens JWT y estado de autenticación
- **api.js**: Cliente HTTP con interceptores para refresh automático

### ✅ **Flujo de Registro**
1. Usuario completa formulario de 3 pasos
2. Se registra en `/auth/register` 
3. Se crea perfil en `/profiles` con datos completos
4. Se sube foto de perfil (opcional)
5. Se navega a onboarding

### ✅ **Flujo de Login**
1. Usuario ingresa email/password
2. Se autentica en `/auth/login`
3. Se recibe token JWT
4. Se redirige según `next` parameter

## 🚀 **Para Probar**

### 1. Levantar Backend
```bash
cd Mi_Mascota_Backend/deploy
docker-compose up -d
```

### 2. Verificar Servicios
- Gateway: http://localhost:8080/health
- Auth: http://localhost:8006/health  
- Profiles: http://localhost:8082/health

### 3. Levantar Frontend
```bash
cd Mi_Mascota_Frontend
npm run dev
```

### 4. Probar Flujos
- Registro: http://localhost:5173/register
- Login: http://localhost:5173/login

## 📋 **Próximos Pasos**

1. **Validar endpoints del backend** - Verificar que coincidan con la implementación
2. **Probar manejo de errores** - Confirmar respuestas del backend
3. **Ajustar esquemas de datos** - Alinear formato frontend/backend
4. **Implementar navegación post-auth** - Redirecciones y rutas protegidas
5. **Agregar validaciones adicionales** - Duplicados, formatos, etc.

## 🔍 **Estructura de Datos**

### Registro (Auth)
```json
{
  "email": "usuario@email.com",
  "password": "password123",
  "name": "Nombre",
  "secondName": "Apellido"
}
```

### Perfil (Profile Service)
```json
{
  "display_name": "Nombre Apellido",
  "role": "client", // o "provider"
  "email": "usuario@email.com",
  "document_type": "CI",
  "document": "12345678",
  "birth_date": "1990-01-01",
  "department": "Montevideo",
  "city": "Montevideo",
  "postal_code": "11000",
  "street": "Calle",
  "number": "123",
  "apartment": "Apto 1"
}
```