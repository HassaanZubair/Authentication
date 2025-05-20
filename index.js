const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./Routes/Auth');
const auth = require('./middleware/auth');
const { Client } = require('pg');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// PostgreSQL client setup
const client = new Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT || 5432,
});

client.connect()
  .then(() => {
    console.log('PostgreSQL Connected');
    // Start server after DB connected
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log('PostgreSQL connection error:', err));

// Make client accessible in routes
app.locals.db = client;

// Routes
app.use('/api/auth', authRoutes);

// Protected route
app.get('/api/private', auth, (req, res) => {
    res.send('This is a protected route');
});

// Root route
app.get('/', (req, res) => {
    res.send('Hello World!');
});
