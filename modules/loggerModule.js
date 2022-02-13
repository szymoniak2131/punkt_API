const Log = require("../schemas/logSchema");

async function ApplicationLogger(type, message) {
  let date = new Date();
  const newLog = new Log({
    date: date,
    message: message,
    type: type,
  });
  newLog.save().catch(() => {
    console.error("Error logging");
  });
}

exports.ApplicationLogger = ApplicationLogger;
