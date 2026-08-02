const express = require('express');
const router = express.Router();
const {
  createGroup,
  getMyGroups,
  getGroupById,
  addMember,
  removeMember
} = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').post(createGroup).get(getMyGroups);
router.route('/:id').get(getGroupById);
router.route('/:id/members').post(addMember);
router.route('/:id/members/:memberId').delete(removeMember);

module.exports = router;