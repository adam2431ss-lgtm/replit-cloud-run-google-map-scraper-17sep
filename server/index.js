require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const placesRouter = require('./routes/places');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for Replit environment
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
// Configure CORS based on environment - optimized for Cloud Run and n8n
const corsOptions = process.env.NODE_ENV === 'production' 
  ? {
      origin: '*', // Allow all origins for Cloud Run and n8n compatibility
      credentials: false,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }
  : {
      origin: [`https://${process.env.REPLIT_DEV_DOMAIN}`, 'http://localhost:5000', 'http://0.0.0.0:5000'],
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    };

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api/places', placesRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Google Maps Scraper API is running' });
});

// In development, proxy all non-API routes to React dev server
if (process.env.NODE_ENV !== 'production') {
  app.use('/', createProxyMiddleware({
    target: 'http://localhost:5000',
    changeOrigin: true,
    ws: true,
    pathRewrite: {
      '^/api': '/api', // Keep API routes as-is
    },
    router: (req) => {
      // Only proxy non-API routes to React
      if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
        return false; // Don't proxy API routes
      }
      return 'http://localhost:5000';
    },
  }));
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Google Places API Key configured: ${process.env.GOOGLE_PLACES_API_KEY ? 'Yes' : 'No'}`);
});