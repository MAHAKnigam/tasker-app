const AuthenticationService = require('../services/AuthenticationService');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    // Verify token
    const result = AuthenticationService.verifyToken(token);

    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: result.error,
      });
    }

    // Attach user ID to request
    req.userId = result.data.id;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};

module.exports = authMiddleware;
