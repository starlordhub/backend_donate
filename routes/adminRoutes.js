const express = require('express');
const router = express.Router();
const { getAllUsers, verifyNGO, deactivateUser, getAdminStats, getAllDonationsAdmin } = require('../controllers/adminController');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/stats', protect, roleCheck('admin'), getAdminStats);
router.get('/users', protect, roleCheck('admin'), getAllUsers);
router.put('/users/:id/verify', protect, roleCheck('admin'), verifyNGO);
router.put('/users/:id/toggle', protect, roleCheck('admin'), deactivateUser);
router.get('/donations', protect, roleCheck('admin'), getAllDonationsAdmin);

module.exports = router;