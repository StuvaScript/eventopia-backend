const ItineraryItem = require("../models/ItineraryItem");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError } = require("../errors/bad_request");
const { NotFoundError } = require("../errors/not_found");
const { default: mongoose } = require("mongoose");

const getAllItineraryItems = async (req, res) => {
  console.log("Req.userId:", req.user);
  const itineraryItems = await ItineraryItem.find({
    user: req.user.userId,
  }).sort("createdAt");
  res
    .status(StatusCodes.OK)
    .json({ itineraryItems, count: itineraryItems.length });
};

const getSingleItineraryItem = async (req, res) => {
  const { id } = req.params;
  console.log(`req.user`, req.user);
  const { userId } = req.user; // <-- changed this from 'req.user.userId'

  console.log("User:", userId);
  console.log("Itinerary Id:", id);

  const itineraryItem = await ItineraryItem.findOne({
    _id: id,
    user: userId,
  });
  if (!itineraryItem) {
    throw new NotFoundError(
      `No itineraryItem with id ${id} for user ${userId}`
    );
  }
  res.status(StatusCodes.OK).json({ itineraryItem });
};

const validateNestedFields = (requiredFields, data, prefix = "") => {
  const missingFields = [];
  for (const field of requiredFields) {
    const fieldName = prefix ? `${prefix}.${field}` : field;
    if (!data[field]) {
      missingFields.push(fieldName);
    }
  }
  return missingFields;
};

const createItineraryItem = async (req, res) => {
  req.body.user = req.user.userId;
  console.log("req.body.user", req.body.user);
  console.log("user:", req.user);

  const venueRequiredFields = ["address", "city", "state", "postalCode"];
  const coordinatesRequiredFields = ["lat", "lng"];

  const missingVenueFields = validateNestedFields(
    venueRequiredFields,
    req.body.venue || {},
    "venue"
  );
  const missingCoordinatesRequiredFields = validateNestedFields(
    coordinatesRequiredFields,
    req.body.venue?.coordinates || {},
    "venue.coordinates"
  );

  const missingFields = [
    ...missingVenueFields,
    ...missingCoordinatesRequiredFields,
  ];

  if (missingFields.length > 0) {
    throw new BadRequestError(`Missing fields: ${missingFields.join(", ")}`);
  }

  const itineraryItem = await ItineraryItem.create(req.body);
  console.log("created item:", itineraryItem);
  res.status(StatusCodes.CREATED).json({ itineraryItem });
};

const updateItineraryItem = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const updates = req.body;

  const venueRequiredFields = ["address", "city", "state", "postalCode"];
  const coordinatesRequiredFields = ["lat", "lng"];

  const missingVenueFields = validateNestedFields(
    venueRequiredFields,
    updates.venue || {},
    "venue"
  );
  const missingCoordinatesRequiredFields = validateNestedFields(
    coordinatesRequiredFields,
    updates.venue?.coordinates || {},
    "venue.coordinates"
  );

  const missingFields = [
    ...missingVenueFields,
    ...missingCoordinatesRequiredFields,
  ];

  if (missingFields.length > 0) {
    throw new BadRequestError(`Missing fields: ${missingFields.join(", ")}`);
  }

  const itineraryItem = await ItineraryItem.findOneAndUpdate(
    { _id: id },
    updates,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!itineraryItem) {
    throw new NotFoundError(`No itinerary item found with id: ${id}`);
  }

  res
    .status(StatusCodes.OK)
    .json({ itineraryItem, message: "Itinerary item updated successfully." });
};

const deleteItineraryItem = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  console.log("id", id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError(`Invalid ID format: ${id}`);
  }

  const objectId = new mongoose.Types.ObjectId(id);
  console.log("objectId:", objectId);
  const itineraryItem = await ItineraryItem.findOneAndDelete({
    _id: id,
    user: userId,
  });

  if (!itineraryItem) {
    throw new NotFoundError(`No itinerary item found with id: ${id}`);
  }

  res
    .status(StatusCodes.OK)
    .json({ message: "Itinerary item deleted successfully." });
};

module.exports = {
  getAllItineraryItems,
  getSingleItineraryItem,
  createItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
};
