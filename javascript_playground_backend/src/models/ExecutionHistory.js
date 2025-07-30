const database = require('../services/database');

class ExecutionHistory {
  // PUBLIC_INTERFACE
  static async create(executionData) {
    /**
     * Create a new execution history entry
     * @param {Object} executionData - Execution data
     * @param {number} executionData.userId - User ID
     * @param {number} executionData.snippetId - Optional snippet ID
     * @param {string} executionData.code - Executed code
     * @param {string} executionData.output - Execution output
     * @param {string} executionData.error - Execution error (if any)
     * @param {number} executionData.executionTime - Execution time in ms
     * @returns {Promise<Object>} Created execution history entry
     */
    const { userId, snippetId = null, code, output = '', error = '', executionTime } = executionData;
    
    const query = `
      INSERT INTO execution_history (user_id, snippet_id, code, output, error, execution_time)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const result = await database.query(query, [userId, snippetId, code, output, error, executionTime]);
    
    return {
      id: result.insertId,
      userId,
      snippetId,
      code,
      output,
      error,
      executionTime,
      created_at: new Date()
    };
  }

  // PUBLIC_INTERFACE
  static async findByUserId(userId, limit = 50, offset = 0) {
    /**
     * Find execution history by user ID
     * @param {number} userId - User ID
     * @param {number} limit - Result limit
     * @param {number} offset - Result offset
     * @returns {Promise<Array>} Array of execution history entries
     */
    const query = `
      SELECT eh.*, cs.title as snippet_title
      FROM execution_history eh
      LEFT JOIN code_snippets cs ON eh.snippet_id = cs.id
      WHERE eh.user_id = ?
      ORDER BY eh.created_at DESC
      LIMIT ? OFFSET ?
    `;
    return await database.query(query, [userId, limit, offset]);
  }

  // PUBLIC_INTERFACE
  static async findById(id, userId) {
    /**
     * Find execution history entry by ID
     * @param {number} id - History entry ID
     * @param {number} userId - User ID (for ownership verification)
     * @returns {Promise<Object|null>} Execution history entry or null
     */
    const query = `
      SELECT eh.*, cs.title as snippet_title
      FROM execution_history eh
      LEFT JOIN code_snippets cs ON eh.snippet_id = cs.id
      WHERE eh.id = ? AND eh.user_id = ?
    `;
    const results = await database.query(query, [id, userId]);
    return results.length > 0 ? results[0] : null;
  }

  // PUBLIC_INTERFACE
  static async deleteByUserId(userId, olderThanDays = 30) {
    /**
     * Delete old execution history entries for a user
     * @param {number} userId - User ID
     * @param {number} olderThanDays - Delete entries older than this many days
     * @returns {Promise<number>} Number of deleted entries
     */
    const query = `
      DELETE FROM execution_history
      WHERE user_id = ? AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
    `;
    const result = await database.query(query, [userId, olderThanDays]);
    return result.affectedRows;
  }

  // PUBLIC_INTERFACE
  static async getStats(userId) {
    /**
     * Get execution statistics for a user
     * @param {number} userId - User ID
     * @returns {Promise<Object>} Execution statistics
     */
    const query = `
      SELECT 
        COUNT(*) as total_executions,
        AVG(execution_time) as avg_execution_time,
        MAX(execution_time) as max_execution_time,
        SUM(CASE WHEN error != '' THEN 1 ELSE 0 END) as error_count
      FROM execution_history
      WHERE user_id = ?
    `;
    const results = await database.query(query, [userId]);
    return results[0] || {
      total_executions: 0,
      avg_execution_time: 0,
      max_execution_time: 0,
      error_count: 0
    };
  }
}

module.exports = ExecutionHistory;
