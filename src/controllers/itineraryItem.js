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

// itineraryItem.js controller
const createItineraryItem = async (req, res) => {
  try {
    const { ticketmasterId, name, startDateTime, venue, url, imageURL, info } =
      req.body;

    // Make sure required fields are present
    if (!ticketmasterId || !name || !startDateTime) {
      return res.status(400).json({
        error:
          "Missing required fields: ticketmasterId, name, or startDateTime",
      });
    }

    // Ensure venue exists and has defaults for missing fields
    const safeVenue = {
      name: venue?.name || "Unknown Venue",
      address: venue?.address || "Unknown Address",
      city: venue?.city || "Unknown City",
      state: venue?.state || "Unknown State",
      postalCode: venue?.postalCode || "00000",
    };

    // Create the itinerary item
    const itineraryItem = await ItineraryItem.create({
      ticketmasterId,
      name,
      startDateTime,
      venue: safeVenue,
      url: url || "",
      imageURL: imageURL || "",
      info: info || "",
      user: req.user.userId, // attach logged-in user from auth middleware
    });

    return res.status(201).json({ itineraryItem });
  } catch (error) {
    console.error("Error in createItineraryItem:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// const createItineraryItem = async (req, res) => {
//   const { ticketmasterId, name, startDateTime, venue, url, imageURL, info } =
//     req.body;

//   // Required fields
//   const missingFields = [];
//   if (!ticketmasterId) missingFields.push("ticketmasterId");
//   if (!name) missingFields.push("name");
//   if (!startDateTime) missingFields.push("startDateTime");

//   if (!venue) {
//     missingFields.push("venue");
//   } else {
//     if (!venue.name) missingFields.push("venue.name");
//     if (!venue.address) missingFields.push("venue.address");
//     if (!venue.city) missingFields.push("venue.city");
//     if (!venue.state) missingFields.push("venue.state");
//     if (!venue.postalCode) missingFields.push("venue.postalCode");
//     // ✅ Make coordinates optional
//     // if (!venue.coordinates?.lat) missingFields.push("venue.coordinates.lat");
//     // if (!venue.coordinates?.lng) missingFields.push("venue.coordinates.lng");
//   }

//   if (missingFields.length > 0) {
//     throw new BadRequestError(`Missing fields: ${missingFields.join(", ")}`);
//   }

//   // Create and save itinerary
//   const itineraryItem = await ItineraryItem.create({
//     ticketmasterId,
//     name,
//     startDateTime,
//     venue,
//     url,
//     imageURL,
//     info,
//     user: req.user.userId,
//   });

//   res.status(StatusCodes.CREATED).json(itineraryItem);
// };

// const createItineraryItem = async (req, res) => {
//   req.body.user = req.user.userId;
//   console.log("req.body.user", req.body.user);
//   console.log("user:", req.user);

//   const venueRequiredFields = ["address", "city", "state", "postalCode"];
//   const coordinatesRequiredFields = ["lat", "lng"];

//   const missingVenueFields = validateNestedFields(
//     venueRequiredFields,
//     req.body.venue || {},
//     "venue"
//   );
//   const missingCoordinatesRequiredFields = validateNestedFields(
//     coordinatesRequiredFields,
//     req.body.venue?.coordinates || {},
//     "venue.coordinates"
//   );

//   const missingFields = [
//     ...missingVenueFields,
//     ...missingCoordinatesRequiredFields,
//   ];

//   if (missingFields.length > 0) {
//     throw new BadRequestError(`Missing fields: ${missingFields.join(", ")}`);
//   }

//   const itineraryItem = await ItineraryItem.create(req.body);
//   console.log("created item:", itineraryItem);
//   res.status(StatusCodes.CREATED).json({ itineraryItem });
// };

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
