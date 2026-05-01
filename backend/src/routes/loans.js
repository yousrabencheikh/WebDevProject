const router = require('express').Router();
const { borrowBook, returnBook, renewLoan, getMyLoans, getAllLoans } = require('../controllers/loanController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/my', authenticate, getMyLoans);
router.get('/', authenticate, authorize('librarian', 'admin'), getAllLoans);
router.post('/borrow', authenticate, borrowBook);
router.put('/:id/return', authenticate, returnBook);
router.put('/:id/renew', authenticate, renewLoan);

module.exports = router;
