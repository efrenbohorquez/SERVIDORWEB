const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Simulación de base de datos en memoria
let users = [
  { id: 1, name: 'Juan Pérez', email: 'juan@example.com', role: 'admin' },
  { id: 2, name: 'María García', email: 'maria@example.com', role: 'user' }
];

let products = [
  { id: 1, name: 'Laptop', price: 999.99, category: 'electronics', stock: 10 },
  { id: 2, name: 'Smartphone', price: 599.99, category: 'electronics', stock: 25 },
  { id: 3, name: 'Libro', price: 19.99, category: 'books', stock: 50 }
];

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         price:
 *           type: number
 *         category:
 *           type: string
 *         stock:
 *           type: integer
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/users', (req, res) => {
  logger.info('GET /api/users - Obteniendo lista de usuarios');
  res.json({
    success: true,
    data: users,
    count: users.length
  });
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    });
  }
  res.json({
    success: true,
    data: user
  });
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crear nuevo usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 */
router.post('/users', 
  auth,
  [
    body('name').notEmpty().withMessage('El nombre es requerido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('role').optional().isIn(['admin', 'user']).withMessage('Rol inválido')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const newUser = {
      id: users.length + 1,
      name: req.body.name,
      email: req.body.email,
      role: req.body.role || 'user'
    };

    users.push(newUser);
    logger.info(`Nuevo usuario creado: ${newUser.email}`);

    res.status(201).json({
      success: true,
      data: newUser,
      message: 'Usuario creado exitosamente'
    });
  }
);

// CRUD para productos
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtener todos los productos
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Lista de productos
 */
router.get('/products', (req, res) => {
  let filteredProducts = products;

  // Filtrar por categoría
  if (req.query.category) {
    filteredProducts = products.filter(p => 
      p.category.toLowerCase().includes(req.query.category.toLowerCase())
    );
  }

  // Limitar resultados
  if (req.query.limit) {
    filteredProducts = filteredProducts.slice(0, parseInt(req.query.limit));
  }

  res.json({
    success: true,
    data: filteredProducts,
    count: filteredProducts.length,
    total: products.length
  });
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Crear nuevo producto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               stock:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 */
router.post('/products',
  auth,
  [
    body('name').notEmpty().withMessage('El nombre es requerido'),
    body('price').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
    body('category').notEmpty().withMessage('La categoría es requerida'),
    body('stock').isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const newProduct = {
      id: products.length + 1,
      name: req.body.name,
      price: parseFloat(req.body.price),
      category: req.body.category,
      stock: parseInt(req.body.stock)
    };

    products.push(newProduct);
    logger.info(`Nuevo producto creado: ${newProduct.name}`);

    res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Producto creado exitosamente'
    });
  }
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Actualizar producto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *       404:
 *         description: Producto no encontrado
 */
router.put('/products/:id', auth, (req, res) => {
  const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));
  
  if (productIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Producto no encontrado'
    });
  }

  products[productIndex] = {
    ...products[productIndex],
    ...req.body,
    id: parseInt(req.params.id)
  };

  logger.info(`Producto actualizado: ${products[productIndex].name}`);

  res.json({
    success: true,
    data: products[productIndex],
    message: 'Producto actualizado exitosamente'
  });
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Eliminar producto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 *       404:
 *         description: Producto no encontrado
 */
router.delete('/products/:id', auth, (req, res) => {
  const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));
  
  if (productIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Producto no encontrado'
    });
  }

  const deletedProduct = products.splice(productIndex, 1)[0];
  logger.info(`Producto eliminado: ${deletedProduct.name}`);

  res.json({
    success: true,
    message: 'Producto eliminado exitosamente'
  });
});

module.exports = router;
