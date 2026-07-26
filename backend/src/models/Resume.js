const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    role: {
      type: String,
    },
    resumeUrl: {
      type: String,
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    contactEmail: {
      type: String,
      default: '',
    },
    linkedinUrl: {
      type: String,
      default: '',
    },
    githubUrl: {
      type: String,
      default: '',
    },
    calendlyUrl: {
      type: String,
      default: '',
    },
    versions: [
      {
        version: {
          type: Number,
          required: true,
        },
        resumeUrl: {
          type: String,
          required: true,
        },
        fileName: {
          type: String,
        },
        note: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    aiScore: {
      type: Number,
      default: null,
    },
    aiFeedback: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    sections: [
      {
        title: String,
        content: String,
      }
    ],
    campaigns: [
      {
        name: {
          type: String,
          required: true,
        },
        jobDescription: String,
        tailoredScore: Number,
        tailoredFeedback: mongoose.Schema.Types.Mixed,
        tailoredSections: [
          {
            title: String,
            content: String,
          }
        ],
        isActive: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        }
      }
    ]
  },
  { timestamps: true }
);

resumeSchema.index({ userId: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('Resume', resumeSchema);
