const express = require('express');
const { requireAuthMiddleware, syncUser } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');
const {
  uploadResume,
  getMyResumes,
  getResumeBySlug,
  updateResume,
  deleteResume,
  getResumeById,
  checkSlugAvailability,
  setActiveVersion,
  updateVersionNote,
  deleteVersion,
  analyzeExistingResume,
  createTailoredCampaign,
  deleteCampaign,
  getTailoredPDF,
} = require('../controllers/resumeController');

const router = express.Router();

router.get('/p/:username/:slug', getResumeBySlug);
router.get('/p/:username/:slug/tailored-pdf', getTailoredPDF);

router.use(requireAuthMiddleware, syncUser);

router.post('/', upload.single('file'), uploadResume);
router.get('/', getMyResumes);
router.get('/check-slug/:slug', checkSlugAvailability);
router.get('/:id', getResumeById);
router.put('/:id', upload.single('file'), updateResume);
router.delete('/:id', deleteResume);

// Version history actions
router.patch('/:id/versions/:versionId/active', setActiveVersion);
router.patch('/:id/versions/:versionId/note', updateVersionNote);
router.delete('/:id/versions/:versionId', deleteVersion);

// AI & Campaigns actions
router.post('/:id/analyze', analyzeExistingResume);
router.post('/:id/campaigns', createTailoredCampaign);
router.delete('/:id/campaigns/:campaignId', deleteCampaign);

module.exports = router;
