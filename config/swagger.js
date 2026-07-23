const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Todo List Management',
      version: '1.0.0',
      description: 'Dokumentasi API untuk aplikasi Todo List (Node.js & MongoDB)',
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        },
      },
    },
  },
  apis: ['./route/*.js'], // Swagger akan baca komentar JSDoc dari semua file di folder route
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;