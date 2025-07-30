const CodeSnippet = require('../models/CodeSnippet');

class SnippetsController {
  // PUBLIC_INTERFACE
  async create(req, res) {
    /**
     * Create a new code snippet
     * @route POST /api/snippets
     * @param {Object} req.body - Request body
     * @param {string} req.body.title - Snippet title
     * @param {string} req.body.code - Code content
     * @param {string} req.body.description - Optional description
     * @param {boolean} req.body.isPublic - Public visibility
     */
    try {
      const { title, code, description, isPublic } = req.body;

      if (!title || !code) {
        return res.status(400).json({
          status: 'error',
          message: 'Title and code are required'
        });
      }

      const snippet = await CodeSnippet.create({
        userId: req.user.id,
        title,
        code,
        description,
        isPublic: !!isPublic
      });

      res.status(201).json({
        status: 'success',
        message: 'Snippet created successfully',
        data: {
          snippet
        }
      });

    } catch (error) {
      console.error('Create snippet error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create snippet'
      });
    }
  }

  // PUBLIC_INTERFACE
  async getAll(req, res) {
    /**
     * Get all snippets for authenticated user
     * @route GET /api/snippets
     * @param {number} req.query.limit - Result limit (default: 50)
     * @param {number} req.query.offset - Result offset (default: 0)
     */
    try {
      const limit = Math.min(parseInt(req.query.limit) || 50, 100);
      const offset = parseInt(req.query.offset) || 0;

      const snippets = await CodeSnippet.findByUserId(req.user.id, limit, offset);

      res.json({
        status: 'success',
        data: {
          snippets,
          pagination: {
            limit,
            offset,
            hasMore: snippets.length === limit
          }
        }
      });

    } catch (error) {
      console.error('Get snippets error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve snippets'
      });
    }
  }

  // PUBLIC_INTERFACE
  async getById(req, res) {
    /**
     * Get snippet by ID
     * @route GET /api/snippets/:id
     * @param {number} req.params.id - Snippet ID
     */
    try {
      const snippetId = parseInt(req.params.id);
      
      if (!snippetId) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid snippet ID'
        });
      }

      const snippet = await CodeSnippet.findById(snippetId);

      if (!snippet) {
        return res.status(404).json({
          status: 'error',
          message: 'Snippet not found'
        });
      }

      // Check if user has access to this snippet
      if (snippet.user_id !== req.user.id && !snippet.is_public) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied'
        });
      }

      res.json({
        status: 'success',
        data: {
          snippet
        }
      });

    } catch (error) {
      console.error('Get snippet by ID error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve snippet'
      });
    }
  }

  // PUBLIC_INTERFACE
  async update(req, res) {
    /**
     * Update a code snippet
     * @route PUT /api/snippets/:id
     * @param {number} req.params.id - Snippet ID
     * @param {Object} req.body - Fields to update
     */
    try {
      const snippetId = parseInt(req.params.id);
      
      if (!snippetId) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid snippet ID'
        });
      }

      const updates = req.body;
      const success = await CodeSnippet.update(snippetId, req.user.id, updates);

      if (!success) {
        return res.status(404).json({
          status: 'error',
          message: 'Snippet not found or access denied'
        });
      }

      // Get updated snippet
      const updatedSnippet = await CodeSnippet.findById(snippetId);

      res.json({
        status: 'success',
        message: 'Snippet updated successfully',
        data: {
          snippet: updatedSnippet
        }
      });

    } catch (error) {
      console.error('Update snippet error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update snippet'
      });
    }
  }

  // PUBLIC_INTERFACE
  async delete(req, res) {
    /**
     * Delete a code snippet
     * @route DELETE /api/snippets/:id
     * @param {number} req.params.id - Snippet ID
     */
    try {
      const snippetId = parseInt(req.params.id);
      
      if (!snippetId) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid snippet ID'
        });
      }

      const success = await CodeSnippet.delete(snippetId, req.user.id);

      if (!success) {
        return res.status(404).json({
          status: 'error',
          message: 'Snippet not found or access denied'
        });
      }

      res.json({
        status: 'success',
        message: 'Snippet deleted successfully'
      });

    } catch (error) {
      console.error('Delete snippet error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete snippet'
      });
    }
  }

  // PUBLIC_INTERFACE
  async getByShareToken(req, res) {
    /**
     * Get snippet by share token (public access)
     * @route GET /api/snippets/share/:token
     * @param {string} req.params.token - Share token
     */
    try {
      const shareToken = req.params.token;

      if (!shareToken) {
        return res.status(400).json({
          status: 'error',
          message: 'Share token is required'
        });
      }

      const snippet = await CodeSnippet.findByShareToken(shareToken);

      if (!snippet) {
        return res.status(404).json({
          status: 'error',
          message: 'Snippet not found'
        });
      }

      res.json({
        status: 'success',
        data: {
          snippet
        }
      });

    } catch (error) {
      console.error('Get snippet by share token error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve snippet'
      });
    }
  }

  // PUBLIC_INTERFACE
  async getPublic(req, res) {
    /**
     * Get public snippets
     * @route GET /api/snippets/public
     * @param {number} req.query.limit - Result limit (default: 20)
     * @param {number} req.query.offset - Result offset (default: 0)
     */
    try {
      const limit = Math.min(parseInt(req.query.limit) || 20, 50);
      const offset = parseInt(req.query.offset) || 0;

      const snippets = await CodeSnippet.getPublicSnippets(limit, offset);

      res.json({
        status: 'success',
        data: {
          snippets,
          pagination: {
            limit,
            offset,
            hasMore: snippets.length === limit
          }
        }
      });

    } catch (error) {
      console.error('Get public snippets error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve public snippets'
      });
    }
  }
}

module.exports = new SnippetsController();
