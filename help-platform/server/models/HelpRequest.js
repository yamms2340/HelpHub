const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['Technology', 'Education', 'Transportation', 'Food', 'Health', 'Household', 'Other'] 
  },
  urgency: { 
    type: String, 
    required: true, 
    enum: ['Low', 'Medium', 'High', 'Critical'] 
  },
  location: { type: String, required: true },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // ✅ Simplified status: Open → In Progress → Completed
  status: { 
    type: String, 
    enum: ['Open', 'In Progress', 'Completed', 'Cancelled'], 
    default: 'Open' 
  },
  
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  acceptedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  
  // Rating and points
  rating: { type: Number, min: 1, max: 5, default: null },
  feedback: { type: String, default: '' },
  pointsAwarded: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('HelpRequest', helpRequestSchema);
