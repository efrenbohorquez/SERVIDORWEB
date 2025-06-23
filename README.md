# 🚀 Servidor Web Completo con Node.js y Express

[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-blue.svg)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub repo size](https://img.shields.io/github/repo-size/efrenbohorquez/SERVIDORWEB)](https://github.com/efrenbohorquez/SERVIDORWEB)

Un servidor web moderno y completo desarrollado con Node.js y Express, que incluye autenticación JWT, API REST, gestión de archivos, middleware de seguridad y documentación automática.

📌 **[Ver Demo en Vivo](http://localhost:3001)** | 📚 **[Documentación API](http://localhost:3001/api-docs)**

## 🚀 Características

- **API REST completa** - CRUD para usuarios y productos
- **Autenticación JWT** - Sistema seguro de login/registro
- **Gestión de archivos** - Subida, descarga y gestión de archivos
- **Middleware de seguridad** - Helmet, CORS, rate limiting
- **Logging avanzado** - Sistema de logs con Winston
- **Documentación automática** - Swagger/OpenAPI integrado
- **Archivos estáticos** - Servir contenido web estático
- **Validación de datos** - express-validator para entrada de datos
- **Compresión** - Optimización de respuestas HTTP

## 📋 Requisitos

- Node.js 16.0.0 o superior
- npm o yarn

## 🛠️ Instalación

1. **Clonar o descargar el proyecto**

   ```bash
   cd SERVIDOR_WEB
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   ```bash
   cp .env.example .env
   ```

   Edita el archivo `.env` con tus configuraciones.

4. **Iniciar el servidor**

   ```bash
   # Desarrollo
   npm run dev

   # Producción
   npm start
   ```

## ⚡ Instalación Rápida

```bash
# Clonar el repositorio
git clone https://github.com/efrenbohorquez/SERVIDORWEB.git
cd SERVIDORWEB

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor
npm start
```

**¡Listo! 🎉** Tu servidor estará disponible en `http://localhost:3001`

## 🌐 Endpoints Principales

### Autenticación

- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario
- `GET /auth/me` - Información del usuario actual

### Usuarios

- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario por ID
- `POST /api/users` - Crear usuario (requiere auth)

### Productos

- `GET /api/products` - Listar productos
- `POST /api/products` - Crear producto (requiere auth)
- `PUT /api/products/:id` - Actualizar producto (requiere auth)
- `DELETE /api/products/:id` - Eliminar producto (requiere auth)

### Archivos

- `POST /files/upload` - Subir archivo (requiere auth)
- `POST /files/upload/multiple` - Subir múltiples archivos
- `GET /files` - Listar archivos
- `GET /files/download/:filename` - Descargar archivo
- `DELETE /files/:id` - Eliminar archivo

## 🔐 Autenticación

### Credenciales de prueba:

- **Admin**: email: `admin@example.com`, password: `password`
- **Usuario**: email: `user@example.com`, password: `password`

### Uso del token:

```bash
# Hacer login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'

# Usar el token en requests autenticados
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 📚 Documentación API

Una vez que el servidor esté ejecutándose, visita:

- **Documentación Swagger**: `http://localhost:3000/api-docs`
- **Página principal**: `http://localhost:3000`

## 📁 Estructura del Proyecto

```
SERVIDOR_WEB/
├── src/
│   ├── config/
│   │   └── swagger.js          # Configuración de Swagger
│   ├── middleware/
│   │   ├── auth.js             # Middleware de autenticación
│   │   └── errorHandler.js     # Manejo de errores
│   ├── routes/
│   │   ├── api.js              # Rutas de la API
│   │   ├── auth.js             # Rutas de autenticación
│   │   └── files.js            # Rutas de archivos
│   ├── utils/
│   │   └── logger.js           # Configuración de logging
│   └── server.js               # Archivo principal del servidor
├── public/
│   └── index.html              # Página web principal
├── uploads/                    # Directorio para archivos subidos
├── logs/                       # Directorio para logs
├── .env.example                # Variables de entorno de ejemplo
├── package.json                # Dependencias y scripts
└── README.md                   # Este archivo
```

## 🧪 Scripts Disponibles

```bash
npm start          # Iniciar servidor en producción
npm run dev        # Iniciar servidor en desarrollo con nodemon
npm test           # Ejecutar tests
npm run lint       # Ejecutar linter
npm run lint:fix   # Corregir errores de linting automáticamente
```

## 🔧 Configuración

### Variables de Entorno (.env)

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=tu_clave_secreta_muy_segura
JWT_EXPIRES_IN=7d
API_VERSION=v1
APP_NAME=Servidor Web Completo
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

## 🛡️ Seguridad

- **Helmet**: Protección básica de headers HTTP
- **CORS**: Configuración de origen cruzado
- **Rate Limiting**: Límite de peticiones por IP
- **JWT**: Tokens seguros para autenticación
- **Validación**: Validación de entrada con express-validator
- **Bcrypt**: Hash seguro de contraseñas

## 📊 Logging

Los logs se guardan en el directorio `logs/`:

- `error.log` - Solo errores
- `combined.log` - Todos los logs

Niveles de log disponibles: error, warn, info, http, verbose, debug, silly

## 🚀 Casos de Uso Recomendados

### 1. **API para Aplicación Web/Móvil**

- Autenticación de usuarios
- CRUD de datos
- Subida de imágenes de perfil
- Sistema de productos/catálogo

### 2. **Sistema de Gestión de Documentos**

- Subida de archivos
- Control de acceso por usuario
- Descarga segura de documentos

### 3. **Backend para E-commerce**

- Gestión de productos
- Autenticación de compradores/vendedores
- Manejo de imágenes de productos

### 4. **API para Dashboard/Panel Administrativo**

- Gestión de usuarios
- Reportes y logs
- Configuración del sistema

### 5. **Microservicio**

- Parte de una arquitectura más grande
- API específica para una funcionalidad
- Integración con otros servicios

## 🌟 Ejemplos de Uso

### Crear un nuevo producto:

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{
    "name": "Nuevo Producto",
    "price": 29.99,
    "category": "electronics",
    "stock": 100
  }'
```

### Subir un archivo:

```bash
curl -X POST http://localhost:3000/files/upload \
  -H "Authorization: Bearer TU_TOKEN" \
  -F "file=@/ruta/a/tu/archivo.pdf"
```

## 🐛 Solución de Problemas

### El servidor no inicia:

- Verifica que el puerto 3000 no esté ocupado
- Revisa las variables de entorno en `.env`
- Comprueba que todas las dependencias estén instaladas

### Error de autenticación:

- Verifica que el JWT_SECRET esté configurado
- Comprueba que el token no haya expirado
- Asegúrate de incluir "Bearer " antes del token

### Archivos no se suben:

- Verifica los permisos del directorio `uploads/`
- Comprueba el tamaño del archivo (máximo 5MB por defecto)
- Revisa que el tipo de archivo esté permitido

## 📞 Soporte

Para reportar problemas o sugerir mejoras, por favor:

1. Revisa la documentación
2. Comprueba los logs en `logs/`
3. Verifica la configuración

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo LICENSE para más detalles.
