const ErrorMsg = require("../schemas/errorMsgSchema");
class ApplicationError extends Error {
  constructor(message, error) {
    super(error);
    this.name = "ApplicationError";
    this.date = new Date();
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApplicationError);
    }
    const newErrorMsg = new ErrorMsg({
      date: this.date,
      message: message,
      error: error,
      name: "ApplicationError",
      stack: this.stack,
    });
    newErrorMsg.save().catch(() => {
      console.error("Error loging exception");
    });
  }
}
module.exports = ApplicationError;
