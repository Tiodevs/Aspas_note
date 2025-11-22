module.exports = {
  // Especifica que vamos usar ts-jest para transformar arquivos TypeScript
  preset: 'ts-jest',
  
  // Define o ambiente de teste como Node.js
  testEnvironment: 'node',
  
  // Pasta onde estão os arquivos de teste
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  
  // Extensões de arquivo que o Jest deve processar
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // Pasta raiz do projeto
  rootDir: './src',
  
  // Limpa os mocks automaticamente entre os testes
  clearMocks: true,
  
  // Mostra informações detalhadas sobre cobertura de código
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/routes/**',
    '!**/server.ts',
    '!**/app.ts',
    '!**/schemas/**',
    '!**/prisma/**',
    '!**/config/**',
    '!**/__tests__/**',
  ]
}; 