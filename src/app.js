require("dotenv").config(); 
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const favicon = require('express-favicon');
const logger = require('morgan');
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const { doubleCsrf } = require("csrf-csrf");

// Middleware imports
const notFoundMiddleware = require('./middleware/not_found');
const errorHandleMiddleware = require('./middleware/error_handler');
const userRouter = require('./routes/user');
const itineraryRouter = require('./routes/itineraryRouter');
const ticketmasterRouter = require("./routes/ticketmasterRouter.js");

// CSRF protection
const { generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.JWT_SECRET,
  cookieName: "x-csrf-token",
  cookieOptions: {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  },
  size: 64,
  getTokenFromRequest: (req) => req.headers["x-csrf-token"],
});

// CORS
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

// Middleware
app.use(helmet());
app.use(logger("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(mongoSanitize());
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(express.json());

// CSRF Token Route
app.get('/api/v1/csrf-token', (req, res) => {
  const token = generateToken(req, res);
  res.cookie("x-csrf-token", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ csrfToken: token });
})


// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
});
app.use("/api/v1", apiLimiter);


// Routes
app.use('/api/v1/user', userRouter);
app.use('/api/v1/itinerary', doubleCsrfProtection, itineraryRouter);
app.use("/api/v1/ticketmaster", doubleCsrfProtection, ticketmasterRouter);

// Error Handling Middleware
app.use(notFoundMiddleware);
app.use((err, req, res, next) => {
  console.error("Error stack:", err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

module.exports = app;
