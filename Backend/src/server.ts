import app from './app';
import { envs } from './config/env';
import { connectMongo } from './database/mongo';

const PORT = envs.server.port;

// Função de inicialização
const startServer = async () => {
  // Conectar ao MongoDB antes de subir o servidor
  await connectMongo();

  if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor Express rodando na porta ${PORT}`);
      console.log(`📝 Aspas Note Backend - Pronto para salvar frases famosas!`);
      console.log(`🌐 Acesse: http://localhost:${PORT}`);
      console.log(`📚 Documentação: http://localhost:${PORT}/health`);
    });
  }
};

startServer();

export default app;