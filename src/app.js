const express = require('express');
const app = express();
const cors = require('cors')
const favicon = require('express-favicon');
const logger = require('morgan');
const notFoundMiddleware = require('./middleware/not_found');
const errorHandleMiddleware = require('./middleware/error_handler');


const mainRouter = require('./routes/mainRouter.js');
const userRouter = require('./routes/user');
const itineraryItemRouter = require('./routes/itineraryItemRouter');

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(express.static('public'))
app.use(favicon(__dirname + '/public/favicon.ico'));


// routes
app.use('/api/v1', mainRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/itinerary', itineraryItemRouter);

// error handling middleware
app.use(notFoundMiddleware);
app.use(errorHandleMiddleware);



module.exports = app;
