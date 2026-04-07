import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      // Build a human-readable error message including the offending fields
      const fieldList = Object.entries(fieldErrors)
        .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
        .join(' | ');
      const message = fieldList
        ? `Validation error - ${fieldList}`
        : 'Validation error';
      res.status(400).json({
        success: false,
        error: message,
        details: fieldErrors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
