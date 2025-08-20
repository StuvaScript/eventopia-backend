require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const favicon = require("express-favicon");
const logger = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const { doubleCsrf } = require("csrf-csrf");

// Middleware imports
const notFoundMiddleware = require("./middleware/not_found");
const errorHandleMiddleware = require("./middleware/error_handler");
const userRouter = require("./routes/user");
const itineraryRouter = require("./routes/itineraryRouter");
const ticketmasterRouter = require("./routes/ticketmasterRouter.js");
const nodemailerRouter = require("./routes/nodemailerRouter");

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Middleware
app.use(helmet());
app.use(logger("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(mongoSanitize());
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(express.json());

app.set("trust proxy", 1);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  trustProxy: process.env.NODE_ENV === "development",
});
app.use("/api", apiLimiter);

// Routes
app.use("/api/email", nodemailerRouter);
app.use("/api/ticketmaster", ticketmasterRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/itinerary", itineraryRouter);

// Error Handling Middleware
app.use(notFoundMiddleware);
app.use((err, req, res, next) => {
  console.error("Error stack:", err.stack);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

app.use(errorHandleMiddleware);

module.exports = app;
