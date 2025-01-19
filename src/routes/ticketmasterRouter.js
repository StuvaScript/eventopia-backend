const express = require("express");
const { searchEvents } = require("../controllers/ticketmasterController");

const ticketmasterRouter = express.Router();

// Route definition with optional parameters marked with ?
ticketmasterRouter.get("/events/:city/:stateCode", searchEvents);

module.exports = ticketmasterRouter;

//The API endpoint will work with formats:
//   /api/ticketmaster/events/CityName/TwoLetterStateCode?dateRangeStart=YYYY-MM-DDTHH:MM:SSZ&dateRangeEnd=YYYY-MM-DDTHH:MM:SSZ&keyword=keyword
//   /api/ticketmaster/events/Seattle/WA?dateRangeStart=2025-02-01T12:00:00Z
//   /api/ticketmaster/events/Seattle/WA?keyword=music
//   /api/ticketmaster/events/Seattle/WA
