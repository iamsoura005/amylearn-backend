'use strict';

const { httpError } = require('../utils/apiHelpers');

function formatIssues(error) {
  if (!error || !Array.isArray(error.issues)) return [];
  return error.issues.map((issue) => ({
    path: Array.isArray(issue.path) ? issue.path.join('.') : String(issue.path || ''),
    message: issue.message,
    code: issue.code
  }));
}

/**
 * Validate one request location against a zod schema and replace the raw value
 * with the parsed (trimmed/coerced) result.
 */
function validate(schema, source = 'body') {
  return function validationMiddleware(req, res, next) {
    if (!schema || typeof schema.safeParse !== 'function') {
      return next(new Error('Invalid validation schema provided.'));
    }
    const raw = source === 'query' ? req.query : source === 'params' ? req.params : req.body;
    const result = schema.safeParse(raw === undefined ? {} : raw);
    if (!result.success) {
      return next(
        httpError(400, 'Validation failed. Please check the submitted values.', formatIssues(result.error))
      );
    }
    if (source === 'query') {
      Object.keys(req.query).forEach((key) => delete req.query[key]);
      Object.assign(req.query, result.data);
    } else if (source === 'params') {
      Object.assign(req.params, result.data);
    } else {
      req.body = result.data;
    }
    return next();
  };
}

const validateBody = (schema) => validate(schema, 'body');
const validateQuery = (schema) => validate(schema, 'query');
const validateParams = (schema) => validate(schema, 'params');

module.exports = { validate, validateBody, validateQuery, validateParams, formatIssues };
