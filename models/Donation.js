const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    donorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Donation title is required'],
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    category: {
        type: String,
        enum: ['food', 'clothing', 'books', 'electronics', 'educational_materials', 'household'],
        required: [true, 'Category is required']
    },
    condition: {
        type: String,
        enum: ['new', 'like_new', 'good', 'fair'],
        required: [true, 'Condition is required']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: 1
    },
    images: [{
        type: String
    }],
    pickupLocation: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postcode: { type: String, trim: true }
    },
    status: {
        type: String,
        enum: ['listed', 'requested', 'collected', 'delivered', 'cancelled'],
        default: 'listed'
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    requestedAt: {
        type: Date,
        default: null
    },
    collectedAt: {
        type: Date,
        default: null
    },
    deliveredAt: {
        type: Date,
        default: null
    },
    impact: {
        co2Saved: { type: Number, default: 0 },
        landfillReduced: { type: Number, default: 0 }
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Donation', donationSchema);