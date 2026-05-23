const Analytics = require('../models/Analytics');
const Resume = require('../models/Resume');

const getResumeAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    
    const resume = await Resume.findOne({ _id: id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const analytics = await Analytics.find({ resumeId: id }).sort({ createdAt: -1 });
    
    res.json({
      totalViews: resume.views,
      analytics,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGlobalAnalytics = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id });
    const resumeIds = resumes.map(r => r._id);

    const analytics = await Analytics.find({ resumeId: { $in: resumeIds } })
      .sort({ createdAt: -1 })
      .populate('resumeId', 'title slug');

    const totalViews = resumes.reduce((sum, r) => sum + r.views, 0);

    res.json({
      totalViews,
      analytics,
      resumesCount: resumes.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logContactClick = async (req, res) => {
  try {
    const { id } = req.params;
    const { eventType } = req.body;

    const validEventTypes = ['click_email', 'click_linkedin', 'click_github', 'click_calendly'];
    if (!validEventTypes.includes(eventType)) {
      return res.status(400).json({ message: 'Invalid click event type' });
    }

    const resume = await Resume.findById(id);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const referrer = req.headers.referer || 'Direct';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const analyticsEntry = await Analytics.create({
      resumeId: id,
      eventType,
      referrer,
      device: userAgent,
    });

    res.status(201).json(analyticsEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getResumeAnalytics,
  getGlobalAnalytics,
  logContactClick,
};
