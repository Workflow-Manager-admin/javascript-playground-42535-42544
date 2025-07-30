const database = require('../services/database');
const bcrypt = require('bcryptjs');

class User {
  // PUBLIC_INTERFACE
  static async create(userData) {
    /**
     * Create a new user
     * @param {Object} userData - User data
     * @param {string} userData.username - Username
     * @param {string} userData.email - Email address
     * @param {string} userData.password - Plain text password
     * @returns {Promise<Object>} Created user data
     */
    const { username, email, password } = userData;
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO users (username, email, password_hash)
      VALUES (?, ?, ?)
    `;
    
    const result = await database.query(query, [username, email, passwordHash]);
    
    // Return user without password
    return {
      id: result.insertId,
      username,
      email,
      created_at: new Date()
    };
  }

  // PUBLIC_INTERFACE
  static async findByEmail(email) {
    /**
     * Find user by email address
     * @param {string} email - Email address
     * @returns {Promise<Object|null>} User data or null
     */
    const query = 'SELECT * FROM users WHERE email = ?';
    const results = await database.query(query, [email]);
    return results.length > 0 ? results[0] : null;
  }

  // PUBLIC_INTERFACE
  static async findByUsername(username) {
    /**
     * Find user by username
     * @param {string} username - Username
     * @returns {Promise<Object|null>} User data or null
     */
    const query = 'SELECT * FROM users WHERE username = ?';
    const results = await database.query(query, [username]);
    return results.length > 0 ? results[0] : null;
  }

  // PUBLIC_INTERFACE
  static async findById(id) {
    /**
     * Find user by ID
     * @param {number} id - User ID
     * @returns {Promise<Object|null>} User data or null
     */
    const query = 'SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?';
    const results = await database.query(query, [id]);
    return results.length > 0 ? results[0] : null;
  }

  // PUBLIC_INTERFACE
  static async verifyPassword(password, hash) {
    /**
     * Verify password against hash
     * @param {string} password - Plain text password
     * @param {string} hash - Password hash
     * @returns {Promise<boolean>} Verification result
     */
    return await bcrypt.compare(password, hash);
  }

  // PUBLIC_INTERFACE
  static async updatePassword(userId, newPassword) {
    /**
     * Update user password
     * @param {number} userId - User ID
     * @param {string} newPassword - New plain text password
     * @returns {Promise<boolean>} Update result
     */
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    const query = 'UPDATE users SET password_hash = ? WHERE id = ?';
    const result = await database.query(query, [passwordHash, userId]);
    
    return result.affectedRows > 0;
  }
}

module.exports = User;
