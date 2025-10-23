
class ErrorHander extends Error {
    constructor(message, status) {

        // Calling parent constructor of base Error class.
        super(message);

        // Saving class name in the property of our custom error as a shortcut.
        this.name = this.constructor.name;

        // Capturing stack trace, excluding constructor call from it
        // (this is probably no longer required in node >=8, see the comments)
        Error.captureStackTrace(this, this.constructor);

        // You can use any additional properties you want.
        // I'm going to use preferred HTTP status for this error types.
        // `500` is the default value if not specified.
        this.status = status || 500;

    }
};


//module.exports = ErrorHander
export default ErrorHander; 