/**
 * authMiddleware.js
 * Validates JWT tokens issued by the Authentication microservice.
 * Attaches decoded user payload to req.user.
 */

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization token missing or malformed.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email, roles, iat, exp }
    next();
  } catch (err) {
    const message =
      err.name === "TokenExpiredError"
        ? "Token has expired."
        : "Invalid token.";
    return res.status(401).json({ success: false, message });
  }
};

/**
 * Role-based access guard.
 * Usage: router.delete('/...', authMiddleware, requireRole('ADMIN'), handler)
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const userRoles = req.user.roles || [];
    const hasRole = roles.some((r) => userRoles.includes(r));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(", ")}`,
      });
    }

    next();
  };
};

module.exports = { authMiddleware, requireRole };