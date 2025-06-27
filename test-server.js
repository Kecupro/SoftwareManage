const express = require('express');
const cors = require('cors');

const app = express();

// CORS middleware
app.use(cors());

// Middleware để đọc JSON
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Server is working!'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🚀 Test server running at http://localhost:${PORT}`);
}); 