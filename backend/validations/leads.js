const Joi = require('joi');

const leadSchema = Joi.object({
  first_name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'First name must be at least 2 characters long',
    'string.max': 'First name cannot exceed 100 characters',
    'any.required': 'First name is required'
  }),
  last_name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Last name must be at least 2 characters long',
    'string.max': 'Last name cannot exceed 100 characters',
    'any.required': 'Last name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional().messages({
    'string.pattern.base': 'Please provide a valid phone number'
  }),
  company: Joi.string().max(255).optional(),
  city: Joi.string().max(100).optional(),
  state: Joi.string().max(100).optional(),
  source: Joi.string().valid('website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other').required().messages({
    'any.only': 'Source must be one of: website, facebook_ads, google_ads, referral, events, other',
    'any.required': 'Source is required'
  }),
  status: Joi.string().valid('new', 'contacted', 'qualified', 'lost', 'won').required().messages({
    'any.only': 'Status must be one of: new, contacted, qualified, lost, won',
    'any.required': 'Status is required'
  }),
  score: Joi.number().integer().min(0).max(100).required().messages({
    'number.base': 'Score must be a number',
    'number.integer': 'Score must be an integer',
    'number.min': 'Score must be between 0 and 100',
    'number.max': 'Score must be between 0 and 100',
    'any.required': 'Score is required'
  }),
  lead_value: Joi.number().precision(2).min(0).required().messages({
    'number.base': 'Lead value must be a number',
    'number.precision': 'Lead value can have up to 2 decimal places',
    'number.min': 'Lead value must be positive',
    'any.required': 'Lead value is required'
  }),
  last_activity_at: Joi.date().iso().optional().messages({
    'date.base': 'Last activity date must be a valid date',
    'date.format': 'Last activity date must be in ISO format'
  }),
  is_qualified: Joi.boolean().default(false)
});

const leadUpdateSchema = Joi.object({
  first_name: Joi.string().min(2).max(100).optional(),
  last_name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
  company: Joi.string().max(255).optional(),
  city: Joi.string().max(100).optional(),
  state: Joi.string().max(100).optional(),
  source: Joi.string().valid('website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other').optional(),
  status: Joi.string().valid('new', 'contacted', 'qualified', 'lost', 'won').optional(),
  score: Joi.number().integer().min(0).max(100).optional(),
  lead_value: Joi.number().precision(2).min(0).optional(),
  last_activity_at: Joi.date().iso().optional(),
  is_qualified: Joi.boolean().optional()
});

const filterSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().optional(),
  status: Joi.alternatives().try(
    Joi.string().valid('new', 'contacted', 'qualified', 'lost', 'won'),
    Joi.array().items(Joi.string().valid('new', 'contacted', 'qualified', 'lost', 'won'))
  ).optional(),
  source: Joi.alternatives().try(
    Joi.string().valid('website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'),
    Joi.array().items(Joi.string().valid('website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'))
  ).optional(),
  score_min: Joi.number().integer().min(0).max(100).optional(),
  score_max: Joi.number().integer().min(0).max(100).optional(),
  lead_value_min: Joi.number().min(0).optional(),
  lead_value_max: Joi.number().min(0).optional(),
  is_qualified: Joi.boolean().optional(),
  date_from: Joi.date().iso().optional(),
  date_to: Joi.date().iso().optional(),
  sort_by: Joi.string().valid('created_at', 'updated_at', 'last_activity_at', 'score', 'lead_value', 'first_name', 'last_name', 'company').default('created_at'),
  sort_order: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  leadSchema,
  leadUpdateSchema,
  filterSchema
};
