const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();



const connectDB = require('./src/config/db');

const { errorHandler, notFound } = require('./src/middleware/errorMiddleware');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running', timestamp: new Date() });
});

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/groups', require('./src/routes/groupRoutes'));
app.use('/api/expenses', require('./src/routes/expenseRoutes'));
app.use('/api/settlements', require('./src/routes/settlementRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});