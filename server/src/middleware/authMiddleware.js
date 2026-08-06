const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function authenticate(request, response, next) {
  try {
    const authorizationHeader = request.headers.authorization;

    if (
      !authorizationHeader ||
      !authorizationHeader.startsWith("Bearer ")
    ) {
      return response.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
    }

    const token = authorizationHeader.split(" ")[1];

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decodedToken.userId);

    if (!user) {
      return response.status(401).json({
        success: false,
        message: "The account for this token no longer exists",
      });
    }

    if (!user.isActive) {
      return response.status(403).json({
        success: false,
        message: "Your account has been disabled",
      });
    }

    request.user = user;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return response.status(401).json({
        success: false,
        message: "Authentication token has expired",
      });
    }

    return response.status(401).json({
      success: false,
      message: "Invalid authentication token",
    });
  }
}

module.exports = authenticate;