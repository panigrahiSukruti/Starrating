import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message
        }));
        res.status(400).json({
          error: 'Validation failed',
          details: issues,
          message: issues.length > 0 ? issues[0].message : 'Validation error'
        });
        return;
      }
      res.status(400).json({ error: 'Malformed request payload' });
    }
  };
};

