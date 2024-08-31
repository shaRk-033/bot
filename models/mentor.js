const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  yearsOfExperience: {
    type: Number,
    required: true,
    min: 0
  },
  domain: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  availableForMentoring: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0
  }
});

const Mentor = mongoose.model('Mentor', mentorSchema);

module.exports = Mentor;
