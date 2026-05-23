const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    referrer: {
      type: String,
      default: 'Direct',
    },
    eventType: {
      type: String,
      enum: ['view', 'click_email', 'click_linkedin', 'click_github', 'click_calendly'],
      default: 'view',
    },
    device: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    country: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analytics', analyticsSchema);
