class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (err, req, res, next) => {
    console.error("Error:", err);
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;

    // Duplicate key error (MongoDB)
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)[0]} entered`;
        err = new ErrorHandler(message, 400);
    }

    // JWT errors
    if (err.name === "jsonWebTokenError") {
        err = new ErrorHandler("jsonWebToken is invalid, please try again", 400);
    }

    if (err.name === "TokenExpiredError") {
        err = new ErrorHandler("jsonWebToken is expired, please try again", 400);
    }

    // MongoDB CastError (invalid ObjectId)
    if (err.name === "CastError") {
        err = new ErrorHandler(`Invalid ${err.path}: ${err.value}`, 400);
    }

    // ✅ Final Response
    res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
};

export default ErrorHandler;
