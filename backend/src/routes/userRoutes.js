const express = require('express');
const router = express.Router();
const { requireAuthMiddleware, syncUser } = require('../middlewares/authMiddleware');

router.get('/profile', requireAuthMiddleware, syncUser, (req, res) => {
  res.json(req.user);
});

module.exports = router;
