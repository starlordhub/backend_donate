const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: 50
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 8,
        select: false
    },
    phone: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['donor', 'ngo', 'admin'],
        default: 'donor',
        required: [true, 'Role is required']
    },
    organisationName: {
        type: String,
        trim: true
    },
    registrationNumber: {
        type: String,
        trim: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    avatar: {
        type: String,
        default: ''
    },
    totalDonations: {
        type: Number,
        default: 0
    },
    totalItemsDonated: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);