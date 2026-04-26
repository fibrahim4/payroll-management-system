const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/attendanceController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getByEmployee);
router.post('/', adminOnly, ctrl.upsert);
router.delete('/:id', adminOnly, ctrl.remove);

module.exports = router;
