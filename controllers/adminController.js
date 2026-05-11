const User = require('../models/User');
const Donation = require('../models/Donation');
const Request = require('../models/Request');

exports.getAllUsers = async (req, res) => {
    try {
        const { role, isVerified } = req.query;
        let query = {};
        if (role) query.role = role;
        if (isVerified !== undefined) query.isVerified = isVerified;

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyNGO = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.role !== 'ngo') {
            return res.status(400).json({ success: false, message: 'User is not an NGO' });
        }
        user.isVerified = true;
        await user.save();
        res.status(200).json({ success: true, message: 'NGO verified successfully', data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deactivateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.isActive = !user.isActive;
        await user.save();
        res.status(200).json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalDonors = await User.countDocuments({ role: 'donor' });
        const totalNGOs = await User.countDocuments({ role: 'ngo' });
        const pendingNGOs = await User.countDocuments({ role: 'ngo', isVerified: false });
        const totalDonations = await Donation.countDocuments();
        const listedDonations = await Donation.countDocuments({ status: 'listed' });
        const deliveredDonations = await Donation.countDocuments({ status: 'delivered' });
        const totalRequests = await Request.countDocuments();

        const categoryStats = await Donation.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                users: { total: totalUsers, donors: totalDonors, ngos: totalNGOs, pendingNGOs },
                donations: { total: totalDonations, listed: listedDonations, delivered: deliveredDonations },
                requests: { total: totalRequests },
                byCategory: categoryStats
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllDonationsAdmin = async (req, res) => {
    try {
        const donations = await Donation.find()
            .populate('donorId', 'firstName lastName')
            .populate('requestedBy', 'firstName lastName organisationName')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: donations.length, data: donations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};