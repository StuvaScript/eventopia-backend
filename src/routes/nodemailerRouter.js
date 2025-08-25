const express = require("express");
const { shareEvent } = require("../controllers/nodemailerController");
const nodemailerRouter = express.Router();

// nodemailerRouter.post("/share-event", shareEvent);

module.exports = nodemailerRouter;
