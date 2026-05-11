const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone, role, organisationName, registrationNumber } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            phone,
            role,
            organisationName: role === 'ngo' ? organisationName : undefined,
            registrationNumber: role === 'ngo' ? registrationNumber : undefined,
            isVerified: role === 'ngo' ? false : true
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: role === 'ngo' ? 'Registration successful. Your account is pending verification.' : 'Registration successful.',
            data: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                token
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        if (!user.isActive) {
            return res.status(401).json({ success: false, message: 'Account has been deactivated' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                token
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};