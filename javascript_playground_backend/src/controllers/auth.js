const User = require('../models/User');
const AuthMiddleware = require('../middleware/auth');

class AuthController {
  // PUBLIC_INTERFACE
  async signup(req, res) {
    /**
     * Register a new user
     * @route POST /api/auth/signup
     * @param {Object} req.body - Request body
     * @param {string} req.body.username - Username
     * @param {string} req.body.email - Email address
     * @param {string} req.body.password - Password
     */
    try {
      const { username, email, password } = req.body;

      // Validate input
      if (!username || !email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Username, email, and password are required'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid email format'
        });
      }

      // Validate password strength
      if (password.length < 6) {
        return res.status(400).json({
          status: 'error',
          message: 'Password must be at least 6 characters long'
        });
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          status: 'error',
          message: 'User with this email already exists'
        });
      }

      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return res.status(409).json({
          status: 'error',
          message: 'Username already taken'
        });
      }

      // Create user
      const user = await User.create({ username, email, password });
      const token = AuthMiddleware.generateToken(user);

      res.status(201).json({
        status: 'success',
        message: 'User created successfully',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          },
          token
        }
      });

    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  }

  // PUBLIC_INTERFACE
  async signin(req, res) {
    /**
     * Authenticate user login
     * @route POST /api/auth/signin
     * @param {Object} req.body - Request body
     * @param {string} req.body.email - Email address
     * @param {string} req.body.password - Password
     */
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Email and password are required'
        });
      }

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password'
        });
      }

      // Verify password
      const isValidPassword = await User.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password'
        });
      }

      // Generate token
      const token = AuthMiddleware.generateToken(user);

      res.json({
        status: 'success',
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          },
          token
        }
      });

    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  }

  // PUBLIC_INTERFACE
  async signout(req, res) {
    /**
     * Sign out user (client-side token removal)
     * @route POST /api/auth/signout
     */
    res.json({
      status: 'success',
      message: 'Signed out successfully'
    });
  }

  // PUBLIC_INTERFACE
  async profile(req, res) {
    /**
     * Get user profile
     * @route GET /api/auth/profile
     */
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      res.json({
        status: 'success',
        data: {
          user
        }
      });

    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new AuthController();
