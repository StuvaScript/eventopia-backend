const ItineraryItem = require('../models/itineraryItem');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError } = require('../errors/bad_request');
const { NotFoundError } = require('../errors/not_found');

const getAllItineraryItems = async (req, res) => {
    const itineraryItems = await ItineraryItem.find({ createdBy: req.user.userId }).sort('createdAt');
    res.status(StatusCodes.OK).json({ itineraryItems, count: itineraryItems.length });
}

const getSingleItineraryItem = async (req, res) => {
    const { user: { userId }, params: {id: itineraryId} } = req; 
    const itineraryItem = await ItineraryItem.findOne({
        _id: itineraryId, createdBy: userId
    });
    if (!itineraryItem) {
        throw new NotFoundError(`No itineraryItem with id ${itineraryId}`);
    }
    res.status(StatusCodes.OK).json({ itineraryItem });
}

const validateNestedFields = (requiredFields, data, prefix = '') => {
    const missingFields = [];
    for (const field of requiredFields) {
        const fieldName = prefix ? `${prefix}.${field}` : field;
        if (!data[field]) {
            missingFields.push(fieldName);
        }
    }
    return missingFields;
}

const createItineraryItem = async (req, res) => {
    req.body.createdBy = req.user.userId;

    const locationRequiredFields = ['address', 'city', 'state', 'postalCode'];
    const coordinatesRequiredFields = ['lat', 'lng'];

    const missingLocationFields = validateNestedFields(locationRequiredFields, req.body.location || {}, 'location');
    const missingCoordinatesRequiredFields = validateNestedFields(coordinatesRequiredFields, req.body.location?.coordinates || {}, 'location.coordinates');

    const missingFields = [
        ...missingLocationFields,
        ...missingCoordinatesRequiredFields,
    ];

    if (missingFields.length > 0) {
        throw new BadRequestError(`Missing fields: ${missingFields.join(', ')}`);
    }

    const itineraryItem = await ItineraryItem.create(req.body);
    res.status(StatusCodes.CREATED).json({ itineraryItem });
}

const updateItineraryItem = async (req, res) => {
    const { body, user: { userId }, params: { id: itineraryId }}  = req;
    const locationRequiredFields = ['address', 'city', 'state', 'postalCode'];
    const coordinatesRequiredFields = ['lat', 'lng'];

    const missingLocationFields = validateNestedFields(locationRequiredFields, body.location || {}, 'location');
    const missingCoordinatesRequiredFields = validateNestedFields(coordinatesRequiredFields, body.location?.coordinates || {}, 'location.coordinates');

    const missingFields = [
        ...missingLocationFields,
        ...missingCoordinatesRequiredFields,
    ]

    if (missingFields.length > 0) {
        throw new BadRequestError(`Missing fields: ${missingFields.join(', ')}`);
    }

    const itineraryItem = await ItineraryItem.findOneAndUpdate(
        { _id: itineraryId, createdBy: userId },
        body,
        { new: true, runValidators: true }
    );

    if (!itineraryItem) {
        throw new NotFoundError(`No itinerary item found with id: ${itineraryId}`);
    }

    res.status(StatusCodes.OK).json({ itineraryItem, message: 'Itinerary item updated successfully.' });
};

const deleteItineraryItem = async (req, res) => {
    const { user: { userId }, params: { id: itineraryId } } = req;
    const itineraryItem = await ItineraryItem.findOneAndDelete({ _id: itineraryId, createdBy: userId });
    if (!itineraryItem) {
        throw new NotFoundError(`No itinerary item found with id: ${itineraryId}`);
    }

    res.status(StatusCodes.OK).json({ message: 'Itinerary item deleted successfully.'})
};

module.exports = {
    getAllItineraryItems,
    getSingleItineraryItem,
    createItineraryItem,
    updateItineraryItem,
    deleteItineraryItem,
}