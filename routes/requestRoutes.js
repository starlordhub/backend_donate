const express = require('express');
const router = express.Router();
const { createRequest, getDonationRequests, getMyRequests, respondToRequest } = require('../controllers/requestController');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/', protect, roleCheck('ngo'), createRequest);
router.get('/received', protect, roleCheck('donor'), getDonationRequests);
router.get('/my', protect, roleCheck('ngo'), getMyRequests);
router.put('/:id/respond', protect, roleCheck('donor'), respondToRequest);

module.exports = router;