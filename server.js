const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const socket = require("socket.io");
const session = require("express-session");
const bodyParser = require("body-parser");
const errorHandler = require("./modules/errorHandler");

const app = express();

require("dotenv").config();
const APP_HOST = require(__dirname + "/routes/config.json")["APP_HOST"][
  process.env.ENV_HOST
];
mongoose.connect(
  "mongodb://localhost:27017/SikorStal",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log("Mongoose connected");
  }
);
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: APP_HOST,
    credentials: true,
  })
);
app.use(
  session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(cookieParser("secretcode"));
app.use(passport.initialize());
app.use(passport.session());
app.use(errorHandler);

let server = app.listen(3110, () => {
  console.log("Server started");
});

const io = socket(server, {
  cors: {
    origin: APP_HOST,
  },
});

require("./routes/initializerRoutes")(app);
require("./middleware/passportConfig")(passport);
require("./routes/loginRoutes")(app);
require("./routes/clientRoutes")(app);
require("./routes/userRoutes")(app);
