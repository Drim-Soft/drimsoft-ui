# Módulo de Gestión de Usuarios

Este módulo permite a los administradores gestionar los usuarios del sistema, incluyendo la creación de nuevos usuarios con cuentas en Supabase.

## Características

### 🔐 Autenticación y Autorización
- Solo usuarios con rol de **Administrador** pueden acceder a este módulo
- Integración completa con Supabase para el registro de usuarios
- Validación de contraseñas en el frontend

### 👥 Gestión de Usuarios
- **CRUD completo** de usuarios
- **Creación de usuarios** con formulario que incluye:
  - Información personal (nombre)
  - Creación de cuenta en Supabase (email, contraseña)
  - Validación de confirmación de contraseña
  - Asignación de rol (Administrador o Drimsoft Team)
  - Asignación de estado (Activo, Inactivo, Eliminado)

### 🎛️ Funcionalidades
- **Tabla de usuarios** con filtros y búsqueda
- **Cambio de roles** directamente desde la tabla
- **Cambio de estados** directamente desde la tabla
- **Eliminación lógica** de usuarios
- **Estadísticas** en tiempo real

## Estructura de Archivos

```
app/
├── services/
│   └── userService.ts          # Servicio para comunicación con el backend
├── components/
│   ├── CreateUserForm.tsx      # Formulario de creación de usuarios
│   └── UsersTable.tsx          # Tabla de usuarios con funcionalidades
├── types/
│   └── user.ts                 # Tipos TypeScript para usuarios
└── users/
    ├── page.tsx                # Página principal del módulo
    └── README.md               # Esta documentación
```

## Integración con Backend

El módulo se comunica con el backend Java a través de los siguientes endpoints:

### Autenticación
- `POST /auth/signup` - Registro de usuario en Supabase
- `POST /auth/login` - Inicio de sesión
- `GET /auth/me` - Información del usuario actual

### Gestión de Usuarios
- `GET /users` - Obtener todos los usuarios
- `GET /users/{id}` - Obtener usuario por ID
- `POST /users` - Crear nuevo usuario
- `PUT /users/{id}` - Actualizar usuario
- `DELETE /users/{id}` - Eliminar usuario (lógico)
- `PATCH /users/{id}/roles/{roleId}` - Asignar rol
- `PUT /users/{id}/status/{statusId}` - Actualizar estado

## Flujo de Creación de Usuario

1. **Validación del formulario** en el frontend
2. **Registro en Supabase** usando el endpoint `/auth/signup`
3. **Creación en base de datos** usando el endpoint `/users`
4. **Actualización de la tabla** con el nuevo usuario

## Roles Disponibles

- **Administrador (ID: 1)**: Acceso completo al sistema
- **Drimsoft Team (ID: 2)**: Acceso limitado

## Estados de Usuario

- **Activo (ID: 1)**: Usuario activo en el sistema
- **Inactivo (ID: 2)**: Usuario temporalmente deshabilitado
- **Eliminado (ID: 3)**: Usuario eliminado lógicamente

## Validaciones

### Frontend
- Nombre requerido
- Email válido
- Contraseña mínimo 6 caracteres
- Confirmación de contraseña debe coincidir

### Backend
- Validación de datos en el servidor
- Verificación de permisos
- Integración con Supabase

## Uso

1. **Acceder al módulo**: Solo administradores pueden ver el enlace "Usuarios" en el sidebar
2. **Crear usuario**: Hacer clic en "Nuevo Usuario" y completar el formulario
3. **Gestionar usuarios**: Usar la tabla para ver, editar, cambiar roles/estados o eliminar usuarios
4. **Filtrar y buscar**: Usar los controles de búsqueda y filtros en la tabla

## Notas Técnicas

- Los tipos TypeScript están centralizados en `app/types/user.ts`
- El servicio maneja toda la comunicación con el backend
- Los componentes son reutilizables y modulares
- La validación de contraseñas es solo para usabilidad (se guarda una sola)
- La eliminación es lógica, no física
