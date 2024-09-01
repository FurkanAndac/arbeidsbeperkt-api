console.log('Server is starting...');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoService = require('./services/mongoService');
const authenticateRequest = require('./middleware/authentication');
require('dotenv').config();

const { ClerkExpressRequireAuth, withAuth } = require('@clerk/clerk-sdk-node');

const app = express();
const port = 5000;

// CORS configuration
const allowedOrigins = ['http://localhost:8080', 'http://localhost:9000', 'https://arbeidsbeperkt.onrender.com', 'https://arbeidsbeperkt.eu'];

const corsOptions = {
  origin: function(origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-Client-Id', 'Authorization'],
  maxAge: 604800, // 7 days
  credentials: true,
};

// app.options('*', cors(corsOptions));  // Pre-flight request handler
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));  // Handle preflight requests
app.use(bodyParser.json());



// // Use the middleware in your routes
// app.use('/api/protected-route', authenticateRequest, (req, res) => {
//   res.send(`Hello, ${req.user.id}`);
// });
// Toggle favorite route

app.post('/api/toggle-favorite', async (req, res) => {
    const { userId, entryId } = req.body;
  
    if (!userId || !entryId) {
      return res.status(400).json({ error: 'userId and entryId are required' });
    }
  
    try {
      const result = await mongoService.toggleFavorite(userId, entryId);
      res.json(result);
    } catch (err) {
      console.error('Error toggling favorite:', err);
      res.status(500).json({ error: err.message });
    }
  });
  
// Get favorites for a user
app.get('/api/favorites', async (req, res) => {
const { userId } = req.query;
console.log(userId)

if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
}

try {
    const favorites = await mongoService.getUserFavorites(userId);
    res.json(favorites);
} catch (err) {
    console.error('Error fetching favorites:', err);
    res.status(500).json({ error: err.message });
}
});

// Existing endpoints
app.post('/api/submit-bedrijven-formulier', async (req, res) => {
  try {
    const result = await mongoService.submitBedrijvenFormulier(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/submit-arbeidsbeperkt-formulier', async (req, res) => {
  try {
    const result = await mongoService.submitArbeidsbeperktFormulier(req.body);
    await mongoService.incrementCounter(); // Increment counter on submission
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/get-counter', async (req, res) => {
  try {
    const result = await mongoService.getCounter();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/formulieren-count', async (req, res) => {
  try {
    const result = await mongoService.getFormulierenCount();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bedrijven-formulieren', async (req, res) => {
  try {
    const result = await mongoService.getBedrijven();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// New endpoints for wachtlijst formulieren
app.post('/api/add-to-wachtlijst', async (req, res) => {
  try {
    const result = await mongoService.addToWachtlijst(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/wachtlijst-formulieren', async (req, res) => {
  try {
    const result = await mongoService.getWachtlijstFormulieren();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/accept-formulier/:id', async (req, res) => {
  try {
    console.log(req.params.id);
    const result = await mongoService.acceptFormulier(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/deny-formulier/:id', async (req, res) => {
  try {
    const result = await mongoService.denyFormulier(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// // Add or remove a favorite entry
// app.post('/api/toggle-favorite', authenticateRequest, async (req, res) => {
//   try {
//     const userId = req.user.id;  // Get the authenticated user's ID
//     const { entryId } = req.body;  // ID of the entry to toggle

//     const result = await mongoService.toggleFavorite(userId, entryId);
//     res.json(result);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Get user's favorite entries
// app.get('/api/favorites', authenticateRequest, async (req, res) => {
//   try {
//     const userId = req.user.id;  // Get the authenticated user's ID
//     const favorites = await mongoService.getUserFavorites(userId);
//     res.json(favorites);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('SIGINT signal received.');
  await mongoService.closeConnection();
  process.exit(0);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
