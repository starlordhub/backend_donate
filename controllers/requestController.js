const Request = require('../models/Request');
const Donation = require('../models/Donation');

exports.createRequest = async (req, res) => {
    try {
        const { donationId, message } = req.body;

        const donation = await Donation.findById(donationId);
        if (!donation) {
            return res.status(404).json({ success: false, message: 'Donation not found' });
        }
        if (donation.status !== 'listed') {
            return res.status(400).json({ success: false, message: 'This donation is no longer available' });
        }

        const existingRequest = await Request.findOne({ donationId, ngoId: req.user._id });
        if (existingRequest) {
            return res.status(400).json({ success: false, message: 'You already requested this donation' });
        }

        const request = await Request.create({
            donationId,
            ngoId: req.user._id,
            donorId: donation.donorId,
            message
        });

        res.status(201).json({ success: true, message: 'Request submitted successfully', data: request });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDonationRequests = async (req, res) => {
    try {
        const requests = await Request.find({ donorId: req.user._id })
            .populate('donationId', 'title category condition quantity')
            .populate('ngoId', 'firstName lastName organisationName')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyRequests = async (req, res) => {
    try {
        const requests = await Request.find({ ngoId: req.user._id })
            .populate('donationId', 'title category condition quantity status pickupLocation')
            .populate('donorId', 'firstName lastName phone')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.respondToRequest = async (req, res) => {
    try {
        const { status } = req.body;
        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }
        if (request.donorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        request.status = status;
        await request.save();

        if (status === 'accepted') {
            await Donation.findByIdAndUpdate(request.donationId, {
                status: 'requested',
                requestedBy: request.ngoId,
                requestedAt: new Date()
            });
        }

        res.status(200).json({ success: true, message: `Request ${status}`, data: request });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};