const express = require('express');
const requestController = require('../controllers/requests');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', requestController.getAllRequests);
router.post('/', auth, requestController.createRequest);
router.put('/:id/offer-help', auth, requestController.offerHelp);
router.put('/:id/confirm', auth, requestController.confirmCompletion);

module.exports = router;
