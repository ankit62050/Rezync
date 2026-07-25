const express = require('express');
const { requireAuthMiddleware, syncUser } = require('../middlewares/authMiddleware');
const { getResumeAnalytics, getGlobalAnalytics, logContactClick, updateSectionTimes } = require('../controllers/analyticsController');

const router = express.Router();

// Public click and time tracking routes
router.post('/:id/click', logContactClick);
router.put('/time/:analyticsId', updateSectionTimes);

router.use(requireAuthMiddleware, syncUser);

router.get('/', getGlobalAnalytics);
router.get('/:id', getResumeAnalytics);

module.exports = router;
