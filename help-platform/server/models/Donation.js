const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  donorName: {
    type: String,
    required: true,
    trim: true
  },
  donorEmail: {
    type: String,
    required: true,
    trim: true
  },
  donorPhone: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    trim: true
  },
  // ✅ CRITICAL FIX: Allow null for general donations
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    default: null,
    required: false
  },
  campaignTitle: {
    type: String,
    trim: true,
    default: 'General Donation'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  razorpayOrderId: {
    type: String,
    required: true
  },
  razorpayPaymentId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },
  paidAt: {
    type: Date
  }
}, {
  timestamps: true
});

// ✅ Indexes for better query performance
donationSchema.index({ donorEmail: 1, createdAt: -1 });
donationSchema.index({ campaignId: 1 });
donationSchema.index({ status: 1 });
donationSchema.index({ razorpayOrderId: 1 });
donationSchema.index({ razorpayPaymentId: 1 });

<<<<<<< HEAD
module.exports = mongoose.model('Donation', donationSchema);
=======
module.exports = mongoose.model('Donation', donationSchema);
>>>>>>> otp-verification
