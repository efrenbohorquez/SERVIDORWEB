const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const logger = require('./utils/logger');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');
const swaggerSetup = require('./config/swagger');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 peticiones por ventana de tiempo
  message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.'
});

// Middleware de seguridad
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(limiter);

// Middleware de logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Middleware de parseo
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use('/static', express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Documentación Swagger
swaggerSetup(app);

// Rutas principales
app.get('/', (req, res) => {
  res.json({
    message: '¡Bienvenido al Servidor Web Completo!',
    version: process.env.API_VERSION || 'v1',
    documentation: '/api-docs',
    endpoints: {
      api: '/api',
      auth: '/auth',
      files: '/files',
      static: '/static',
      uploads: '/uploads'
    }
  });
});

// Rutas de la API
app.use('/api', apiRoutes);
app.use('/auth', authRoutes);
app.use('/files', fileRoutes);

// Middleware de manejo de errores
app.use(notFound);
app.use(errorHandler);

// Iniciar el servidor
app.listen(PORT, () => {
  logger.info(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  logger.info(`📚 Documentación disponible en http://localhost:${PORT}/api-docs`);
  logger.info(`🌐 Aplicación disponible en http://localhost:${PORT}`);
});

module.exports = app;
