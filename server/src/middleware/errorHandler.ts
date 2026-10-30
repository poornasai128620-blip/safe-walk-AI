import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    logger.warn('Request validation failed', {
      path: req.path,
      method: req.method,
      issues: err.issues
    });
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Request payload validation failed',
      details: err.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
    });
  }

  logger.error('Unhandled internal server error', {
    path: req.path,
    method: req.method,
    errorMessage: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  return res.status(500).json({
    error: 'InternalServerError',
    message: 'An unexpected internal error occurred. Please try again or activate manual SOS directly.'
  });
};
