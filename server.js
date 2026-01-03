import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for login
app.post('/api/login', (req, res) => {
  const { email, password, userType } = req.body;
  
  // Mock authentication - In production, you would verify against a database
  console.log(`Login attempt - Type: ${userType}, Email: ${email}`);
  
  // Simulate authentication logic
  if (email && password) {
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        email: email,
        userType: userType,
        name: 'Test User'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Serve the login page for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
