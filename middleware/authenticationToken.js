const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = async function (req, res, next) {
  const token = req.header("x-access-token");

  if (!token) {
    res.status(401).json({
      errors: [
        {
          msg: "Token not found",
        },
      ],
    });
  } else {
    try {
      const user = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      req.user = user._id;
      next();
    } catch (error) {
      res.status(403).json({
        errors: [
          {
            msg: "Invalid token",
          },
        ],
      });
    }
  }
};
