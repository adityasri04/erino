const express = require('express');
const { query, getRow, getRows } = require('../config/database');
const { leadSchema, leadUpdateSchema, filterSchema } = require('../validations/leads');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all lead routes
router.use(authenticateToken);

// Create lead
router.post('/', async (req, res) => {
  try {
    // Validate input
    const { error, value } = leadSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: error.details.map(detail => detail.message)
      });
    }

    const leadData = { ...value, user_id: req.user.id };

    // Check if email already exists for this user
    const existingLead = await getRow(
      'SELECT id FROM leads WHERE email = $1 AND user_id = $2',
      [leadData.email, req.user.id]
    );

    if (existingLead) {
      return res.status(400).json({
        success: false,
        error: 'Lead with this email already exists'
      });
    }

    // Insert lead
    const result = await query(
      `INSERT INTO leads (
        user_id, first_name, last_name, email, phone, company, city, state, 
        source, status, score, lead_value, last_activity_at, is_qualified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        leadData.user_id, leadData.first_name, leadData.last_name, leadData.email,
        leadData.phone, leadData.company, leadData.city, leadData.state,
        leadData.source, leadData.status, leadData.score, leadData.lead_value,
        leadData.last_activity_at, leadData.is_qualified
      ]
    );

    const lead = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: { lead }
    });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create lead'
    });
  }
});

// Get leads with pagination and filters
router.get('/', async (req, res) => {
  try {
    // Validate query parameters
    const { error, value } = filterSchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: error.details.map(detail => detail.message)
      });
    }

    const {
      page = 1,
      limit = 20,
      search,
      status,
      source,
      score_min,
      score_max,
      lead_value_min,
      lead_value_max,
      is_qualified,
      date_from,
      date_to,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = value;

    // Build WHERE clause
    let whereConditions = ['user_id = $1'];
    let params = [req.user.id];
    let paramIndex = 2;

    // Search functionality
    if (search) {
      whereConditions.push(`(
        LOWER(first_name) LIKE LOWER($${paramIndex}) OR 
        LOWER(last_name) LIKE LOWER($${paramIndex}) OR 
        LOWER(email) LIKE LOWER($${paramIndex}) OR 
        LOWER(company) LIKE LOWER($${paramIndex}) OR 
        LOWER(city) LIKE LOWER($${paramIndex})
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Status filter
    if (status) {
      if (Array.isArray(status)) {
        whereConditions.push(`status = ANY($${paramIndex})`);
        params.push(status);
      } else {
        whereConditions.push(`status = $${paramIndex}`);
        params.push(status);
      }
      paramIndex++;
    }

    // Source filter
    if (source) {
      if (Array.isArray(source)) {
        whereConditions.push(`source = ANY($${paramIndex})`);
        params.push(source);
      } else {
        whereConditions.push(`source = $${paramIndex}`);
        params.push(source);
      }
      paramIndex++;
    }

    // Score range filter
    if (score_min !== undefined) {
      whereConditions.push(`score >= $${paramIndex}`);
      params.push(score_min);
      paramIndex++;
    }
    if (score_max !== undefined) {
      whereConditions.push(`score <= $${paramIndex}`);
      params.push(score_max);
      paramIndex++;
    }

    // Lead value range filter
    if (lead_value_min !== undefined) {
      whereConditions.push(`lead_value >= $${paramIndex}`);
      params.push(lead_value_min);
      paramIndex++;
    }
    if (lead_value_max !== undefined) {
      whereConditions.push(`lead_value <= $${paramIndex}`);
      params.push(lead_value_max);
      paramIndex++;
    }

    // Qualification filter
    if (is_qualified !== undefined) {
      whereConditions.push(`is_qualified = $${paramIndex}`);
      params.push(is_qualified);
      paramIndex++;
    }

    // Date range filter
    if (date_from) {
      whereConditions.push(`created_at >= $${paramIndex}`);
      params.push(date_from);
      paramIndex++;
    }
    if (date_to) {
      whereConditions.push(`created_at <= $${paramIndex}`);
      params.push(date_to);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM leads ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get leads with pagination
    const leadsResult = await query(
      `SELECT * FROM leads ${whereClause} 
       ORDER BY ${sort_by} ${sort_order.toUpperCase()}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    const leads = leadsResult.rows;

    res.status(200).json({
      success: true,
      data: leads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leads'
    });
  }
});

// Get single lead
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await getRow(
      'SELECT * FROM leads WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { lead }
    });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lead'
    });
  }
});

// Update lead
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if lead exists and belongs to user
    const existingLead = await getRow(
      'SELECT id FROM leads WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (!existingLead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    // Validate input
    const { error, value } = leadUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: error.details.map(detail => detail.message)
      });
    }

    // Check email uniqueness if email is being updated
    if (value.email) {
      const emailExists = await getRow(
        'SELECT id FROM leads WHERE email = $1 AND user_id = $2 AND id != $3',
        [value.email, req.user.id, id]
      );

      if (emailExists) {
        return res.status(400).json({
          success: false,
          error: 'Lead with this email already exists'
        });
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const updateParams = [];
    let paramIndex = 1;

    Object.keys(value).forEach(key => {
      if (value[key] !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        updateParams.push(value[key]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    // Add updated_at and id to params
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateParams.push(id);

    const result = await query(
      `UPDATE leads SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      updateParams
    );

    const lead = result.rows[0];

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: { lead }
    });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update lead'
    });
  }
});

// Delete lead
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if lead exists and belongs to user
    const existingLead = await getRow(
      'SELECT id FROM leads WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (!existingLead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    // Delete lead
    await query('DELETE FROM leads WHERE id = $1', [id]);

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete lead'
    });
  }
});

module.exports = router;
