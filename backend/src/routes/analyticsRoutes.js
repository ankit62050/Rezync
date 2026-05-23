const express = require('express');
const { requireAuthMiddleware, syncUser } = require('../middlewares/authMiddleware');
const { getResumeAnalytics, getGlobalAnalytics, logContactClick } = require('../controllers/analyticsController');

const router = express.Router();

// Public click tracking route
router.post('/:id/click', logContactClick);

router.use(requireAuthMiddleware, syncUser);

router.get('/', getGlobalAnalytics);
router.get('/:id', getResumeAnalytics);

module.exports = router;
