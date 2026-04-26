const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/payrollController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.post('/generate/:employeeId', adminOnly, ctrl.generate);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.put('/:id/pay', adminOnly, ctrl.markPaid);
router.get('/:id/download', ctrl.downloadPayslip);

module.exports = router;
