const express = require("express");
const dotenv = require("dotenv");
const mysql = require("mysql2");
const path = require("path");

// Load environment variables
dotenv.config(); // change path acc. (default: .env)

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set the public directory for static files
app.use(express.static(path.join(__dirname, "public")));

// connect to db
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Route to serve the HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const tableName = process.env.TABLE_NAME;

// GET endpoint to fetch all users
app.get(`/${tableName}`, (req, res) => {
  const query = `SELECT * FROM ${tableName}`;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send("Database query failed.");
    }
    res.json(results);
  });
});

// POST endpoint to add a new user
app.post(`/${tableName}`, (req, res) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  const query = `INSERT INTO ${tableName} (name, email) VALUES (?, ?)`;
  db.query(query, [name, email], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Failed to add user" });
    }
    res.json({ 
      message: "User added successfully", 
      id: result.insertId,
      name,
      email 
    });
  });
});

// DELETE endpoint to remove a user
app.delete(`/${tableName}/:id`, (req, res) => {
  const userId = req.params.id;
  
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const query = `DELETE FROM ${tableName} WHERE id = ?`;
  db.query(query, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Failed to delete user" });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ message: "User deleted successfully" });
  });
});

// test connection
db.connect((err) => {
  if (err) throw err;
  console.log("Connected to database!");
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
