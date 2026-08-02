const express = require('express');
const router = express.Router();
const { recordSettlement, getGroupSettlements } = require('../controllers/settlementController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', recordSettlement);
router.get('/group/:groupId', getGroupSettlements);

module.exports = router;