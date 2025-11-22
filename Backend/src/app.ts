import express from 'express';
import cors from 'cors';

// Rotas
import routes from './routes/routes';
import { envs } from './config/env';

const app = express();

app.use(express.json());

// Middleware para CORS
// app.use(cors({
//   origin: envs.server.host,
//   credentials: true
// }));
app.use(cors({
  origin: true,
  credentials: true
}));

// Rota principal
app.get('/', (req, res) => {
  res.json({
    message: 'Bem-vindo ao backend da Aspas Note!',
    version: '1.0.0',
    description: 'API para gerenciar frases de famosos',
    endpoints: {
      phrases: '/api/phrases',
      users: '/api/users'
    }
  });
});


// Registrar as rotas
app.use('/api', routes);


export default app; 