const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors/unauthenticated');

// console.log('JWT_SECRET:', process.env.JWT_SECRET);

const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("Auth header: ", authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new UnauthenticatedError('Token missing or invalid'));
    }
    const token = authHeader.split(' ')[1];
    console.log('JWT Token:', token);

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { userId: payload.userId, firstName: payload.firstName, lastName: payload.lastName };
        next();
    } catch (error) {
        return next(new UnauthenticatedError('Authentication invalid'));
    }
};

module.exports = auth;

