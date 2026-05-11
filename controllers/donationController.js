const User = require('../models/User');
const Donation = require('../models/Donation');

exports.createDonation = async (req, res) => {
    try {
        const { title, description, category, condition, quantity, pickupLocation, notes } = req.body;

        const donation = await Donation.create({
            donorId: req.user._id,
            title,
            description,
            category,
            condition,
            quantity,
            pickupLocation,
            notes
        });

        await User.findByIdAndUpdate(req.user._id, {
            $inc: { totalDonations: 1, totalItemsDonated: quantity }
        });

        res.status(201).json({ success: true, message: 'Donation created successfully', data: donation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyDonations = async (req, res) => {
    try {
        const donations = await Donation.find({ donorId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: donations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllDonations = async (req, res) => {
    try {
        const { category, status, city, sort } = req.query;
        let query = { status: 'listed' };

        if (category) query.category = category;
        if (city) query['pickupLocation.city'] = { $regex: city, $options: 'i' };

        let sortOption = { createdAt: -1 };
        if (sort === 'oldest') sortOption = { createdAt: 1 };

        const donations = await Donation.find(query).populate('donorId', 'firstName lastName').sort(sortOption);
        res.status(200).json({ success: true, count: donations.length, data: donations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDonationById = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id).populate('donorId', 'firstName lastName phone email');
        if (!donation) {
            return res.status(404).json({ success: false, message: 'Donation not found' });
        }
        res.status(200).json({ success: true, data: donation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateDonationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({ success: false, message: 'Donation not found' });
        }

        donation.status = status;

        if (status === 'requested') donation.requestedAt = new Date();
        if (status === 'collected') donation.collectedAt = new Date();
        if (status === 'delivered') {
            donation.deliveredAt = new Date();
            donation.impact.co2Saved = donation.quantity * 0.35;
            donation.impact.landfillReduced = donation.quantity * 0.06;
        }

        await donation.save();
        res.status(200).json({ success: true, message: 'Donation status updated', data: donation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteDonation = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);
        if (!donation) {
            return res.status(404).json({ success: false, message: 'Donation not found' });
        }
        if (donation.donorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this donation' });
        }
        if (donation.status !== 'listed') {
            return res.status(400).json({ success: false, message: 'Can only delete listed donations' });
        }
        await donation.deleteOne();
        res.status(200).json({ success: true, message: 'Donation deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};