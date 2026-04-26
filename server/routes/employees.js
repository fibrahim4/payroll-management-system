const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/employeeController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', adminOnly, ctrl.create);
router.put('/:id', adminOnly, ctrl.update);
router.delete('/:id', adminOnly, ctrl.remove);

module.exports = router;
