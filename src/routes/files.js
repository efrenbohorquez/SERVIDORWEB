const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Crear directorio de uploads si no existe
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Tipos de archivo permitidos
  const allowedTypes = /jpeg|jpg|png|gif|pdf|txt|doc|docx|zip/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB por defecto
  },
  fileFilter
});

// Base de datos simulada para metadatos de archivos
let files = [];

/**
 * @swagger
 * components:
 *   schemas:
 *     FileResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         originalName:
 *           type: string
 *         filename:
 *           type: string
 *         mimetype:
 *           type: string
 *         size:
 *           type: integer
 *         uploadDate:
 *           type: string
 *           format: date-time
 *         downloadUrl:
 *           type: string
 */

/**
 * @swagger
 * /files/upload:
 *   post:
 *     summary: Subir archivo
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Archivo subido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 file:
 *                   $ref: '#/components/schemas/FileResponse'
 *       400:
 *         description: Error en la subida del archivo
 */
router.post('/upload', auth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      });
    }

    const fileData = {
      id: uuidv4(),
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadDate: new Date().toISOString(),
      uploadedBy: req.user.id,
      downloadUrl: `/files/download/${req.file.filename}`
    };

    files.push(fileData);
    logger.info(`Archivo subido: ${req.file.originalname} por usuario ${req.user.id}`);

    res.json({
      success: true,
      message: 'Archivo subido exitosamente',
      file: fileData
    });

  } catch (error) {
    logger.error('Error subiendo archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /files/upload/multiple:
 *   post:
 *     summary: Subir múltiples archivos
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Archivos subidos exitosamente
 */
router.post('/upload/multiple', auth, upload.array('files', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron archivos'
      });
    }

    const uploadedFiles = req.files.map(file => {
      const fileData = {
        id: uuidv4(),
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        uploadDate: new Date().toISOString(),
        uploadedBy: req.user.id,
        downloadUrl: `/files/download/${file.filename}`
      };

      files.push(fileData);
      return fileData;
    });

    logger.info(`${uploadedFiles.length} archivos subidos por usuario ${req.user.id}`);

    res.json({
      success: true,
      message: `${uploadedFiles.length} archivos subidos exitosamente`,
      files: uploadedFiles
    });

  } catch (error) {
    logger.error('Error subiendo archivos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /files:
 *   get:
 *     summary: Listar archivos subidos
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de archivos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 files:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FileResponse'
 */
router.get('/', auth, (req, res) => {
  // Solo mostrar archivos del usuario actual (o todos si es admin)
  const userFiles = req.user.role === 'admin' 
    ? files 
    : files.filter(file => file.uploadedBy === req.user.id);

  res.json({
    success: true,
    files: userFiles,
    count: userFiles.length
  });
});

/**
 * @swagger
 * /files/download/{filename}:
 *   get:
 *     summary: Descargar archivo
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Archivo descargado
 *       404:
 *         description: Archivo no encontrado
 */
router.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);

  // Verificar si el archivo existe
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: 'Archivo no encontrado'
    });
  }

  // Buscar metadatos del archivo
  const fileData = files.find(f => f.filename === filename);
  
  logger.info(`Descargando archivo: ${filename}`);

  // Configurar headers para descarga
  if (fileData) {
    res.setHeader('Content-Disposition', `attachment; filename="${fileData.originalName}"`);
    res.setHeader('Content-Type', fileData.mimetype);
  }

  res.sendFile(filePath);
});

/**
 * @swagger
 * /files/{id}:
 *   delete:
 *     summary: Eliminar archivo
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Archivo eliminado exitosamente
 *       404:
 *         description: Archivo no encontrado
 *       403:
 *         description: No autorizado para eliminar este archivo
 */
router.delete('/:id', auth, (req, res) => {
  const fileId = req.params.id;
  const fileIndex = files.findIndex(f => f.id === fileId);

  if (fileIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Archivo no encontrado'
    });
  }

  const file = files[fileIndex];

  // Verificar permisos (solo el propietario o admin puede eliminar)
  if (file.uploadedBy !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'No autorizado para eliminar este archivo'
    });
  }

  // Eliminar archivo físico
  const filePath = path.join(uploadDir, file.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Eliminar de la base de datos
  files.splice(fileIndex, 1);

  logger.info(`Archivo eliminado: ${file.originalName} por usuario ${req.user.id}`);

  res.json({
    success: true,
    message: 'Archivo eliminado exitosamente'
  });
});

module.exports = router;
