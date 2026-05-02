const router = require('express').Router();
const { body } = require('express-validator');
const {
  getBooks, getBook, createBook, updateBook, deleteBook, getCategories,
} = require('../controllers/bookController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', getBooks);
router.get('/categories', getCategories);
router.get('/:id', getBook);

router.post('/', authenticate, authorize('librarian', 'admin'), [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('author').trim().notEmpty().withMessage('Author required'),
  body('isbn').trim().notEmpty().withMessage('ISBN required'),
  body('category').trim().notEmpty().withMessage('Category required'),
  body('total_copies').isInt({ min: 1 }).withMessage('Copies must be a positive integer'),
], createBook);

router.put('/:id', authenticate, authorize('librarian', 'admin'), [
  body('total_copies').optional().isInt({ min: 0 }).withMessage('Copies must be non-negative'),
], updateBook);

router.delete('/:id', authenticate, authorize('librarian', 'admin'), deleteBook);

module.exports = router;
