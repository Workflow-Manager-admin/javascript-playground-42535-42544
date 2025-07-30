const codeExecutionService = require('../services/codeExecution');
const ExecutionHistory = require('../models/ExecutionHistory');

class ExecutionController {
  // PUBLIC_INTERFACE
  async executeCode(req, res) {
    /**
     * Execute JavaScript code
     * @route POST /api/execute
     * @param {Object} req.body - Request body
     * @param {string} req.body.code - JavaScript code to execute
     * @param {number} req.body.snippetId - Optional snippet ID
     */
    try {
      const { code, snippetId } = req.body;

      if (!code) {
        return res.status(400).json({
          status: 'error',
          message: 'Code is required'
        });
      }

      // Validate code
      const validation = codeExecutionService.validateCode(code);
      if (!validation.isValid) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid code',
          errors: validation.errors
        });
      }

      // Execute code
      const result = await codeExecutionService.executeCode(code);

      // Save to execution history if user is authenticated
      if (req.user) {
        await ExecutionHistory.create({
          userId: req.user.id,
          snippetId: snippetId || null,
          code,
          output: result.output,
          error: result.error,
          executionTime: result.executionTime
        });
      }

      res.json({
        status: 'success',
        data: {
          output: result.output,
          error: result.error,
          executionTime: result.executionTime,
          hasError: !!result.error
        }
      });

    } catch (error) {
      console.error('Code execution error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Code execution failed'
      });
    }
  }

  // PUBLIC_INTERFACE
  async getHistory(req, res) {
    /**
     * Get execution history for authenticated user
     * @route GET /api/execute/history
     * @param {number} req.query.limit - Result limit (default: 50)
     * @param {number} req.query.offset - Result offset (default: 0)
     */
    try {
      const limit = Math.min(parseInt(req.query.limit) || 50, 100);
      const offset = parseInt(req.query.offset) || 0;

      const history = await ExecutionHistory.findByUserId(req.user.id, limit, offset);

      res.json({
        status: 'success',
        data: {
          history,
          pagination: {
            limit,
            offset,
            hasMore: history.length === limit
          }
        }
      });

    } catch (error) {
      console.error('Get history error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve execution history'
      });
    }
  }

  // PUBLIC_INTERFACE
  async getHistoryById(req, res) {
    /**
     * Get specific execution history entry
     * @route GET /api/execute/history/:id
     * @param {number} req.params.id - History entry ID
     */
    try {
      const historyId = parseInt(req.params.id);
      
      if (!historyId) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid history ID'
        });
      }

      const historyEntry = await ExecutionHistory.findById(historyId, req.user.id);

      if (!historyEntry) {
        return res.status(404).json({
          status: 'error',
          message: 'History entry not found'
        });
      }

      res.json({
        status: 'success',
        data: {
          history: historyEntry
        }
      });

    } catch (error) {
      console.error('Get history by ID error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve history entry'
      });
    }
  }

  // PUBLIC_INTERFACE
  async getStats(req, res) {
    /**
     * Get execution statistics for authenticated user
     * @route GET /api/execute/stats
     */
    try {
      const stats = await ExecutionHistory.getStats(req.user.id);

      res.json({
        status: 'success',
        data: {
          stats
        }
      });

    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve statistics'
      });
    }
  }
}

module.exports = new ExecutionController();
