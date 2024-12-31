require("dotenv").config(); // Make sure this is at the top

const express = require("express");
const app = express();
const cors = require("cors");
const favicon = require("express-favicon");
const logger = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");

const mainRouter = require("./routes/mainRouter.js");
const ticketmasterRouter = require("./routes/ticketmasterRouter.js");

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger("dev"));
app.use(express.static("public"));
app.use(favicon(__dirname + "/public/favicon.ico"));
app.use(helmet());
app.use(mongoSanitize());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
});

//Routes
app.use("/api", apiLimiter);
app.use("/api/v1", mainRouter);
app.use("/api/v1/ticketmaster", ticketmasterRouter);

module.exports = app;
