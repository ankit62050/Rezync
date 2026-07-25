const Resume = require('../models/Resume');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const Analytics = require('../models/Analytics');

const uploadResume = async (req, res) => {
  try {
    const { title, slug, role, isPublic, note, contactEmail, linkedinUrl, githubUrl, calendlyUrl, runAI } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No resume file uploaded' });
    }

    const existing = await Resume.findOne({ userId: req.user._id, slug });
    if (existing) {
      return res.status(400).json({ message: 'Slug already taken' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'image',
      format: 'pdf',
      folder: 'resumex',
    });

    let aiScore = null;
    let aiFeedback = null;
    let sections = [];

    if (runAI === 'true' || runAI === true) {
      try {
        const { parsePDF } = require('../services/pdfParser');
        const { analyzeResumeText } = require('../services/geminiService');
        const text = await parsePDF(req.file.buffer);
        const analysis = await analyzeResumeText(text);
        aiScore = analysis.score;
        aiFeedback = analysis.feedback;
        sections = analysis.sections;
      } catch (aiErr) {
        console.error('AI analysis during upload failed:', aiErr);
        // Throw error so configuration issues (e.g. missing API key) are immediately clear
        return res.status(400).json({ message: `AI analysis failed: ${aiErr.message}` });
      }
    }

    const fileNote = note || 'Initial Upload';
    const resume = await Resume.create({
      userId: req.user._id,
      title,
      slug,
      role,
      resumeUrl: result.secure_url,
      isPublic: isPublic === 'true' || isPublic === true,
      contactEmail: contactEmail || '',
      linkedinUrl: linkedinUrl || '',
      githubUrl: githubUrl || '',
      calendlyUrl: calendlyUrl || '',
      aiScore,
      aiFeedback,
      sections,
      versions: [
        {
          version: 1,
          resumeUrl: result.secure_url,
          fileName: req.file.originalname || 'Resume.pdf',
          note: fileNote,
          createdAt: new Date(),
        }
      ]
    });

    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getResumeBySlug = async (req, res) => {
  try {
    const { username, slug } = req.params;
    const { ref } = req.query;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const resume = await Resume.findOne({ userId: user._id, slug }).populate('userId', 'name email');

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (!resume.isPublic) {
      return res.status(403).json({ message: 'Resume is private' });
    }

    // Ensure versions exist (migration fallback)
    if (!resume.versions || resume.versions.length === 0) {
      resume.versions = [{
        version: resume.version || 1,
        resumeUrl: resume.resumeUrl,
        fileName: 'Original Resume.pdf',
        note: 'Original Version',
        createdAt: resume.updatedAt || resume.createdAt || new Date(),
      }];
      await resume.save();
    }

    const referrer = ref ? `Campaign: ${ref}` : (req.headers.referer || 'Direct');
    const userAgent = req.headers['user-agent'] || 'Unknown';
    
    const analyticsEntry = await Analytics.create({
      resumeId: resume._id,
      referrer,
      device: userAgent,
    });

    resume.views += 1;
    await resume.save();

    const responseData = resume.toObject();
    responseData.analyticsId = analyticsEntry._id;

    if (ref) {
      const campaign = resume.campaigns.find(c => c.name.toLowerCase() === ref.toLowerCase());
      if (campaign) {
        responseData.activeCampaign = {
          name: campaign.name,
          tailoredScore: campaign.tailoredScore,
          tailoredFeedback: campaign.tailoredFeedback,
          sections: campaign.tailoredSections
        };
      }
    }

    res.json(responseData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateResume = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, role, isPublic, slug, note, contactEmail, linkedinUrl, githubUrl, calendlyUrl } = req.body;
    
    const resume = await Resume.findOne({ _id: id, userId: req.user._id });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Ensure versions array exists for fallback
    if (!resume.versions || resume.versions.length === 0) {
      resume.versions = [{
        version: resume.version || 1,
        resumeUrl: resume.resumeUrl,
        fileName: 'Original Resume.pdf',
        note: 'Original Version',
        createdAt: resume.updatedAt || resume.createdAt || new Date(),
      }];
    }

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
      const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: 'image',
        format: 'pdf',
        folder: 'resumex',
      });
      
      const newVersionNum = (resume.version || 1) + 1;
      const fileNote = note || `Tailored Version v${newVersionNum}`;
      
      const newVersion = {
        version: newVersionNum,
        resumeUrl: result.secure_url,
        fileName: req.file.originalname || 'Tailored Resume.pdf',
        note: fileNote,
        createdAt: new Date(),
      };
      
      resume.versions.push(newVersion);
      resume.resumeUrl = result.secure_url;
      resume.version = newVersionNum;
    }

    if (slug && slug !== resume.slug) {
      const slugConflict = await Resume.findOne({ userId: req.user._id, slug, _id: { $ne: id } });
      if (slugConflict) {
        return res.status(400).json({ message: 'Slug already taken' });
      }
      resume.slug = slug;
    }

    if (title) resume.title = title;
    if (role) resume.role = role;
    if (isPublic !== undefined) resume.isPublic = isPublic === 'true' || isPublic === true;
    if (contactEmail !== undefined) resume.contactEmail = contactEmail;
    if (linkedinUrl !== undefined) resume.linkedinUrl = linkedinUrl;
    if (githubUrl !== undefined) resume.githubUrl = githubUrl;
    if (calendlyUrl !== undefined) resume.calendlyUrl = calendlyUrl;

    await resume.save();
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findOneAndDelete({ _id: id, userId: req.user._id });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getResumeById = async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findOne({ _id: id, userId: req.user._id });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Ensure versions exist (migration fallback)
    if (!resume.versions || resume.versions.length === 0) {
      resume.versions = [{
        version: resume.version || 1,
        resumeUrl: resume.resumeUrl,
        fileName: 'Original Resume.pdf',
        note: 'Original Version',
        createdAt: resume.updatedAt || resume.createdAt || new Date(),
      }];
      await resume.save();
    }

    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkSlugAvailability = async (req, res) => {
  try {
    const { slug } = req.params;
    const { excludeId } = req.query;

    const query = { userId: req.user._id, slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await Resume.findOne(query);
    res.json({ available: !existing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const setActiveVersion = async (req, res) => {
  try {
    const { id, versionId } = req.params;
    const resume = await Resume.findOne({ _id: id, userId: req.user._id });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const selectedVersion = resume.versions.id(versionId);
    if (!selectedVersion) {
      return res.status(404).json({ message: 'Version not found' });
    }

    resume.resumeUrl = selectedVersion.resumeUrl;
    resume.version = selectedVersion.version;

    await resume.save();
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateVersionNote = async (req, res) => {
  try {
    const { id, versionId } = req.params;
    const { note } = req.body;
    const resume = await Resume.findOne({ _id: id, userId: req.user._id });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const selectedVersion = resume.versions.id(versionId);
    if (!selectedVersion) {
      return res.status(404).json({ message: 'Version not found' });
    }

    selectedVersion.note = note;
    await resume.save();
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteVersion = async (req, res) => {
  try {
    const { id, versionId } = req.params;
    const resume = await Resume.findOne({ _id: id, userId: req.user._id });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const selectedVersion = resume.versions.id(versionId);
    if (!selectedVersion) {
      return res.status(404).json({ message: 'Version not found' });
    }

    // Check if user is trying to delete the currently active version
    if (selectedVersion.resumeUrl === resume.resumeUrl || selectedVersion.version === resume.version) {
      return res.status(400).json({ message: 'Cannot delete the currently active version. Set another version as active first.' });
    }

    resume.versions.pull({ _id: versionId });
    await resume.save();
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const analyzeExistingResume = async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findOne({ _id: id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const { getPDFTextFromUrl } = require('../services/pdfParser');
    const { analyzeResumeText } = require('../services/geminiService');

    const text = await getPDFTextFromUrl(resume.resumeUrl);
    const analysis = await analyzeResumeText(text);

    resume.aiScore = analysis.score;
    resume.aiFeedback = analysis.feedback;
    resume.sections = analysis.sections;

    await resume.save();
    res.json(resume);
  } catch (error) {
    console.error('Error analyzing existing resume:', error);
    res.status(500).json({ message: error.message });
  }
};

const createTailoredCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, jobDescription } = req.body;

    if (!name || !jobDescription) {
      return res.status(400).json({ message: 'Campaign name and job description are required' });
    }

    const resume = await Resume.findOne({ _id: id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const existingCampaign = resume.campaigns.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existingCampaign) {
      return res.status(400).json({ message: `Campaign link '?ref=${name}' already exists. Use a different name.` });
    }

    const { getPDFTextFromUrl } = require('../services/pdfParser');
    const { tailorResumeText } = require('../services/geminiService');

    const text = await getPDFTextFromUrl(resume.resumeUrl);
    const tailoring = await tailorResumeText(text, jobDescription);

    const newCampaign = {
      name: name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      jobDescription,
      tailoredScore: tailoring.score,
      tailoredFeedback: tailoring.feedback,
      tailoredSections: tailoring.sections,
      createdAt: new Date(),
    };

    resume.campaigns.push(newCampaign);
    await resume.save();

    res.status(201).json(resume);
  } catch (error) {
    console.error('Error tailoring resume:', error);
    res.status(500).json({ message: error.message });
  }
};

const deleteCampaign = async (req, res) => {
  try {
    const { id, campaignId } = req.params;
    const resume = await Resume.findOne({ _id: id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    resume.campaigns.pull({ _id: campaignId });
    await resume.save();

    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
