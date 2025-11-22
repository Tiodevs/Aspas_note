import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { envs } from '../config/env';

// Interface para o payload do token JWT
interface JwtPayload {
    userId: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

// Middleware para verificar token JWT
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        res.status(401).json({
            error: 'Token de acesso não fornecido',
            code: 'MISSING_TOKEN'
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, envs.auth.jwtSecret) as JwtPayload;
        
        // Adicionar dados do usuário ao request
        (req as any).user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };
        
        next();
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                error: 'Token expirado',
                code: 'TOKEN_EXPIRED'
            });
            return;
        }
        
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                error: 'Token inválido',
                code: 'INVALID_TOKEN'
            });
            return;
        }
        
        res.status(500).json({
            error: 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        });
    }
};
