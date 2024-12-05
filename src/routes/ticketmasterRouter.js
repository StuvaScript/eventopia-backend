const express = require("express");
const ticketmasterController = require("../controllers/ticketmasterController");

const ticketmasterRouter = express.Router();

ticketmasterRouter.get(
  "/api/events/:city/:stateCode/:startDateTime/:endDateTime",
  ticketmasterController.searchEvents
);

module.exports = ticketmasterRouter;
