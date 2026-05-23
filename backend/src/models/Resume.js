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
      unique: true,
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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
