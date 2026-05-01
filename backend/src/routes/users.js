const router = require('express').Router();
const { getUsers, getUser, updateUserRole, toggleUserStatus } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin'), getUsers);
router.get('/:id', authenticate, authorize('admin'), getUser);
router.put('/:id/role', authenticate, authorize('admin'), updateUserRole);
router.put('/:id/toggle-status', authenticate, authorize('admin'), toggleUserStatus);

module.exports = router;
