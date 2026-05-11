const express = require('express');
const router = express.Router();
const { createDonation, getMyDonations, getAllDonations, getDonationById, updateDonationStatus, deleteDonation } = require('../controllers/donationController');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/', protect, roleCheck('donor'), createDonation);
router.get('/my', protect, roleCheck('donor'), getMyDonations);
router.get('/', protect, roleCheck('ngo', 'admin'), getAllDonations);
router.get('/:id', protect, getDonationById);
router.put('/:id/status', protect, updateDonationStatus);
router.delete('/:id', protect, roleCheck('donor'), deleteDonation);

module.exports = router;