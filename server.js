require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const connectDB = require('./config/database');
const todoRoutes = require('./routes/todos');

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, 'public')));

app.get('/manifest.webmanifest', (req, res) => {
    res.set('Content-Type', 'application/manifest+json');
    res.sendFile(path.join(__dirname, 'public', 'manifest.webmanifest'));
});

app.use('/api/todos', todoRoutes);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 1000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to see the app`);
    console.log(`Or visit http://127.0.0.1:${PORT}`);
});