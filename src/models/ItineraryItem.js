const mongoose = require("mongoose");

const ItineraryItemSchema = new mongoose.Schema(
  {
    ticketmasterId: {
      type: String,
      required: [true, "Error: no ticketmasterId provided for itinerary item."],
      unique: [
        true,
        "Error: duplicate ticketmasterId provided for itinerary item.",
      ],
    },
    name: {
      type: String,
      required: [true, "Error: no name provided for itinerary item."],
      maxlength: 25,
    },
    startDateTime: {
      type: Date,
      required: [true, "Error: no date provided for itinerary item."],
    },
    venue: {
      name: {
        type: String,
        required: [true, "Error: no venue name provided for itinerary item."],
      },
      address: {
        type: String,
        required: [true, "Error: no address provided for itinerary item."],
      },
      city: {
        type: String,
        required: [true, "Error: no city provided for itinerary item."],
      },
      state: {
        type: String,
        required: [true, "Error: no state provided for itinerary item."],
      },
      postalCode: {
        type: String,
        required: [true, "Error: no zipcode provided for itinerary item."],
      },
      coordinates: {
        lat: {
          type: Number,
          required: [true, "Error: no latitude provided for venue."],
        },
        lng: {
          type: Number,
          required: [true, "Error: no longitude provided for venue."],
        },
      },
    },
    url: {
      type: String,
    },
    imageURL: {
      type: String,
    },
    info: {
      type: String,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Error: no user provided for itinerary item."],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ItineraryItem", ItineraryItemSchema);
