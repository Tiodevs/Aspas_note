import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Carrega as variáveis de ambiente do arquivo .env se existir
// O dotenv não sobrescreve variáveis que já existem no ambiente (por padrão)
// Então, se as variáveis vêm do Docker via env_file, elas terão prioridade
const envPath = resolve(__dirname, '../../.env');
if (existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
}

export const envs = {
    server: {
        port: parseInt(process.env.PORT || '4000', 10),
        host: process.env.FRONTEND_URL || "http://localhost:3000",
    },
    auth: {
        jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-in-production"
    },
    email: {
        apiKey: process.env.RESEND_API_KEY || "",
        sender: process.env.EMAIL_SENDER || "onboarding@resend.dev"
    },
    database: {
        url: process.env.DATABASE_URL || " "
    },
    mongo: {
        uri: process.env.MONGO_URI || "mongodb://localhost:27017/aspas_note"
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY || ""
    }
}