const CustomAPIError = require('./custom_api');

class UnauthenticatedError extends CustomAPIError {
    constructor(message) {
        super(message);
        this.statusCode = 401;
    }
}

module.exports = { UnauthenticatedError };


