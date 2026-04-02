import AppError from '../utils/AppError.js';

/**
 * Returns middleware that validates req[source] against a Joi schema.
 * Sends a 400 with the first validation error message on failure.
 *
 * @param {Object} schema  - Joi schema
 * @param {string} source  - 'body' | 'query' | 'params'
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: true,
      stripUnknown: true, // silently remove undeclared keys
    });

    if (error) {
      return next(new AppError(error.details[0].message, 400));
    }

    // Replace raw input with coerced, sanitised values
    req[source] = value;
    next();
  };
};

export default validate;
