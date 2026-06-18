import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes.js';
import db from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend client calls
app.use(cors({
  origin: '*', // In development allow all, or configure to localhost:5173
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API healthcheck endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', project: 'student-disciplinary-record-&' });
});

// Attach all dashboard API routes
app.use('/api', routes);

// Serve static frontend assets in production
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('API Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// For SPA routing, serve index.html for any unmatched non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) {
      // If the frontend build is missing, return a developer landing page
      res.status(200).send(`
        <html>
          <head>
            <title>Gowthami Disciplinary Log API</title>
            <style>
              body { font-family: sans-serif; text-align: center; padding: 4rem; background-color: #0f172a; color: #f8fafc; }
              a { color: #8b5cf6; text-decoration: none; font-weight: bold; }
              .btn { display: inline-block; padding: 0.75rem 1.5rem; background-color: #1e293b; border: 1px solid #334155; border-radius: 8px; margin-top: 1rem; }
              .btn:hover { background-color: #334155; }
            </style>
          </head>
          <body>
            <h1>Sri Gowthami Disciplinary Log API Server</h1>
            <p>This port (5000) runs the backend REST API services.</p>
            <p>The frontend production build was not found at <code>frontend/dist</code>.</p>
            <p>To view the interactive Web Dashboard in development, make sure to run the frontend dev server:</p>
            <div class="btn">
              <a href="http://localhost:5173/">Open Web Dashboard (Port 5173)</a>
            </div>
          </body>
        </html>
      `);
    }
  });
});

let server;
if (!process.env.VERCEL) {
  server = app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`Backend API Server running on port ${PORT}`);
    console.log(`Health endpoint: http://localhost:${PORT}/health`);
    console.log(`=========================================`);
  });
}

// Graceful shutdown
if (server) {
  process.on('SIGINT', () => {
    console.log('Shutting down server...');
    server.close(() => {
      console.log('API Server stopped.');
      process.exit(0);
    });
  });
}

export default app;
