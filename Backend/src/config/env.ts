import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config({ path: resolve(__dirname, '../../.env') });

export const envs = {
    server: {
        port: process.env.PORT || 4000,
        host: process.env.FRONTEND_URL || "http://localhost:3000",
    },
    auth: {
        jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-in-production"
    },
    email: {
        user: process.env.EMAIL_USER || " ",
        password: process.env.EMAIL_PASS || " ",
        sender: process.env.EMAIL_SENDER || " "
    },
    database: {
        url: process.env.DATABASE_URL || " "
    }
}