const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT secret - in production this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

class AuthMiddleware {
  // PUBLIC_INTERFACE
  static generateToken(user) {
    /**
     * Generate JWT token for user
     * @param {Object} user - User object
     * @returns {string} JWT token
     */
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  // PUBLIC_INTERFACE
  static authenticate(req, res, next) {
    /**
     * Middleware to authenticate JWT token
     */
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Access token required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Token expired'
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token'
        });
      } else {
        return res.status(500).json({
          status: 'error',
          message: 'Token verification failed'
        });
      }
    }
  }

  // PUBLIC_INTERFACE
  static optional(req, res, next) {
    /**
     * Optional authentication middleware - doesn't fail if no token
     */
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      req.user = null;
    }

    next();
  }
}

module.exports = AuthMiddleware;
