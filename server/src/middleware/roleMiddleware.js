function authorizeRoles(...allowedRoles) {
  return function (request, response, next) {
    if (!request.user) {
      return response.status(401).json({
        success: false,
        message: "Authentication is required",
      });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return response.status(403).json({
        success: false,
        message: "You are not allowed to perform this action",
      });
    }

    next();
  };
}

module.exports = authorizeRoles;