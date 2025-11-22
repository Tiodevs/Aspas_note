import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/aspas_note';

export const connectMongo = async (retries = 5) => {
    while (retries > 0) {
        try {
            console.log(`🔌 Tentando conectar ao MongoDB em: ${MONGO_URI} (Tentativas restantes: ${retries})`);
            await mongoose.connect(MONGO_URI, {
                serverSelectionTimeoutMS: 5000
            });
            console.log('✅ MongoDB connected successfully');
            return;
        } catch (error) {
            console.error(`❌ Erro ao conectar ao MongoDB:`, error);
            retries -= 1;
            console.log(`⏳ Aguardando 5 segundos antes de tentar novamente...`);
            await new Promise(res => setTimeout(res, 5000));
        }
    }
    console.error('💀 Falha crítica: Não foi possível conectar ao MongoDB após várias tentativas.');
};

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected');
});
