require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');
const logger = require('./middleware/logger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const authRoute = require('./route/authRoute');
const todoRoute = require('./route/todoRoute');
const categoryRoute = require('./route/categoryRoute');
const activityLogRoute = require('./route/activityLogRoute');
const statsRoute = require('./route/statsRoute');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

app.use(express.json());
app.use(logger);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/todos', todoRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/activity-logs', activityLogRoute);
app.use('/api/stats', statsRoute);
app.use('/api/auth', authRoute);

app.get('/', (req, res) => {
    res.send('API Todo List is running...');
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;