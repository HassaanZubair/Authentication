const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    const client = req.app.locals.db;
    try {
        const userCheck = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await client.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
            [name, email, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully' });

    } catch (error) {
        console.log('Register Error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const client = req.app.locals.db;
    try {
        const userQuery = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userQuery.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userQuery.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.json({ token });
    } catch (error) {
        console.log('Login Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
