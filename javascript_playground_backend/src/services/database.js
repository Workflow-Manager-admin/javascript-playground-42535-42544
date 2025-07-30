const mysql = require('mysql2/promise');

class DatabaseService {
  constructor() {
    this.pool = null;
    this.initializePool();
  }

  // PUBLIC_INTERFACE
  initializePool() {
    /**
     * Initialize database connection pool using environment variables
     */
    const config = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'javascript_playground',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

    this.pool = mysql.createPool(config);
  }

  // PUBLIC_INTERFACE
  async query(sql, params = []) {
    /**
     * Execute a database query
     * @param {string} sql - SQL query string
     * @param {Array} params - Query parameters
     * @returns {Promise} Query result
     */
    try {
      const [results] = await this.pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // PUBLIC_INTERFACE
  async transaction(callback) {
    /**
     * Execute queries within a transaction
     * @param {Function} callback - Function containing queries to execute
     * @returns {Promise} Transaction result
     */
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // PUBLIC_INTERFACE
  async initializeTables() {
    /**
     * Create database tables if they don't exist
     */
    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS code_snippets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        code TEXT NOT NULL,
        description TEXT,
        share_token VARCHAR(255) UNIQUE,
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS execution_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        snippet_id INT,
        code TEXT NOT NULL,
        output TEXT,
        error TEXT,
        execution_time FLOAT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (snippet_id) REFERENCES code_snippets(id) ON DELETE SET NULL
      )`
    ];

    for (const query of queries) {
      try {
        await this.query(query);
      } catch (error) {
        console.error('Error creating table:', error);
        throw error;
      }
    }
  }

  // PUBLIC_INTERFACE
  async close() {
    /**
     * Close database connection pool
     */
    if (this.pool) {
      await this.pool.end();
    }
  }
}

module.exports = new DatabaseService();
