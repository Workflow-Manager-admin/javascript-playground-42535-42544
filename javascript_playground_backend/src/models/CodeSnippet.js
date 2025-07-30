const database = require('../services/database');
const { v4: uuidv4 } = require('uuid');

class CodeSnippet {
  // PUBLIC_INTERFACE
  static async create(snippetData) {
    /**
     * Create a new code snippet
     * @param {Object} snippetData - Snippet data
     * @param {number} snippetData.userId - User ID
     * @param {string} snippetData.title - Snippet title
     * @param {string} snippetData.code - Code content
     * @param {string} snippetData.description - Optional description
     * @param {boolean} snippetData.isPublic - Public visibility
     * @returns {Promise<Object>} Created snippet data
     */
    const { userId, title, code, description = '', isPublic = false } = snippetData;
    const shareToken = uuidv4();
    
    const query = `
      INSERT INTO code_snippets (user_id, title, code, description, share_token, is_public)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const result = await database.query(query, [userId, title, code, description, shareToken, isPublic]);
    
    return {
      id: result.insertId,
      userId,
      title,
      code,
      description,
      shareToken,
      isPublic,
      created_at: new Date()
    };
  }

  // PUBLIC_INTERFACE
  static async findById(id) {
    /**
     * Find snippet by ID
     * @param {number} id - Snippet ID
     * @returns {Promise<Object|null>} Snippet data or null
     */
    const query = `
      SELECT cs.*, u.username
      FROM code_snippets cs
      JOIN users u ON cs.user_id = u.id
      WHERE cs.id = ?
    `;
    const results = await database.query(query, [id]);
    return results.length > 0 ? results[0] : null;
  }

  // PUBLIC_INTERFACE
  static async findByShareToken(shareToken) {
    /**
     * Find snippet by share token
     * @param {string} shareToken - Share token
     * @returns {Promise<Object|null>} Snippet data or null
     */
    const query = `
      SELECT cs.*, u.username
      FROM code_snippets cs
      JOIN users u ON cs.user_id = u.id
      WHERE cs.share_token = ?
    `;
    const results = await database.query(query, [shareToken]);
    return results.length > 0 ? results[0] : null;
  }

  // PUBLIC_INTERFACE
  static async findByUserId(userId, limit = 50, offset = 0) {
    /**
     * Find snippets by user ID
     * @param {number} userId - User ID
     * @param {number} limit - Result limit
     * @param {number} offset - Result offset
     * @returns {Promise<Array>} Array of snippets
     */
    const query = `
      SELECT * FROM code_snippets
      WHERE user_id = ?
      ORDER BY updated_at DESC
      LIMIT ? OFFSET ?
    `;
    return await database.query(query, [userId, limit, offset]);
  }

  // PUBLIC_INTERFACE
  static async update(id, userId, updates) {
    /**
     * Update a code snippet
     * @param {number} id - Snippet ID
     * @param {number} userId - User ID (for ownership verification)
     * @param {Object} updates - Fields to update
     * @returns {Promise<boolean>} Update result
     */
    const allowedFields = ['title', 'code', 'description', 'is_public'];
    const updateFields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (updateFields.length === 0) {
      return false;
    }
    
    values.push(id, userId);
    const query = `
      UPDATE code_snippets
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;
    
    const result = await database.query(query, values);
    return result.affectedRows > 0;
  }

  // PUBLIC_INTERFACE
  static async delete(id, userId) {
    /**
     * Delete a code snippet
     * @param {number} id - Snippet ID
     * @param {number} userId - User ID (for ownership verification)
     * @returns {Promise<boolean>} Delete result
     */
    const query = 'DELETE FROM code_snippets WHERE id = ? AND user_id = ?';
    const result = await database.query(query, [id, userId]);
    return result.affectedRows > 0;
  }

  // PUBLIC_INTERFACE
  static async getPublicSnippets(limit = 20, offset = 0) {
    /**
     * Get public snippets
     * @param {number} limit - Result limit
     * @param {number} offset - Result offset
     * @returns {Promise<Array>} Array of public snippets
     */
    const query = `
      SELECT cs.id, cs.title, cs.description, cs.share_token, cs.created_at, u.username
      FROM code_snippets cs
      JOIN users u ON cs.user_id = u.id
      WHERE cs.is_public = true
      ORDER BY cs.created_at DESC
      LIMIT ? OFFSET ?
    `;
    return await database.query(query, [limit, offset]);
  }
}

module.exports = CodeSnippet;
