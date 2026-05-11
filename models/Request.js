const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    donationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donation',
        required: true
    },
    ngoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    donorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        trim: true,
        maxlength: 300
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'collected', 'completed'],
        default: 'pending'
    },
    adminNotes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

requestSchema.index({ donationId: 1, ngoId: 1 }, { unique: true });

module.exports = mongoose.model('Request', requestSchema);