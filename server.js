const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Enhanced CORS configuration
const corsOptions = {
  origin: 'http://localhost:8000', // Match your Live Server port
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'todo_app'
});

// Connect to MySQL database
db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});

// API endpoints
app.get('/tasks', (req, res) => {
  db.query('SELECT * FROM tasks ORDER BY due_date, due_time', (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.post('/tasks', (req, res) => {
  const { task, due_date, due_time } = req.body;
  const sql = 'INSERT INTO tasks (task, due_date, due_time) VALUES (?, ?, ?)';
  db.query(sql, [task, due_date, due_time], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ id: result.insertId, task, due_date, due_time });
  });
});

app.put('/tasks/:id', (req, res) => {
  const { task, due_date, due_time } = req.body;
  const sql = 'UPDATE tasks SET task = ?, due_date = ?, due_time = ? WHERE id = ?';
  db.query(sql, [task, due_date, due_time, req.params.id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ id: req.params.id, task, due_date, due_time });
  });
});

app.delete('/tasks/:id', (req, res) => {
  const sql = 'DELETE FROM tasks WHERE id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Task deleted successfully' });
  });
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${port}`);
});