import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

// Middleware de validação para req.body
export const validate = (schema: z.ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Valida e transforma os dados
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }));

        res.status(400).json({
          error: 'Dados inválidos',
          details: errors,
          code: 'VALIDATION_ERROR'
        });
        return;
      }

      // Erro inesperado
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

// Middleware de validação para req.params
export const validateParams = (schema: z.ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Valida e transforma os parâmetros
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }));

        res.status(400).json({
          error: 'Parâmetros inválidos',
          details: errors,
          code: 'VALIDATION_ERROR'
        });
        return;
      }

      // Erro inesperado
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

// Middleware de validação para req.query
export const validateQuery = (schema: z.ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Valida e transforma os query parameters
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }));

        res.status(400).json({
          error: 'Query parameters inválidos',
          details: errors,
          code: 'VALIDATION_ERROR'
        });
        return;
      }

      // Erro inesperado
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };
}; 