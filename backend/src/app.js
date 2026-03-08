const cors = require('cors');
const express = require('express');
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');

// Initialize express app
const app = express();

/**
 * CORS configuration:
 * - Prefer explicit allow-list using NEXT_PUBLIC_FRONTEND_URL (and optionally NEXT_PUBLIC_API_BASE/NEXT_PUBLIC_BACKEND_URL)
 * - Fall back to permissive behavior only when no origin env is provided (to keep local/dev friction low).
 */
const allowedOrigins = [
  process.env.NEXT_PUBLIC_FRONTEND_URL,
  process.env.NEXT_PUBLIC_API_BASE,
  process.env.NEXT_PUBLIC_BACKEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin / server-to-server / curl requests (no Origin header)
      if (!origin) return callback(null, true);

      // If an allow-list exists, enforce it.
      if (allowedOrigins.length > 0) {
        const isAllowed = allowedOrigins.includes(origin);
        return callback(
          isAllowed ? null : new Error('CORS: origin not allowed'),
          isAllowed
        );
      }

      // No allow-list configured: allow all.
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.set('trust proxy', true);

app.use('/docs', swaggerUi.serve, (req, res, next) => {
  // Prefer env-driven server URL to avoid incorrect server URLs behind proxies.
  // Frontend env names are re-used here because that's what this container provides.
  const preferredServerUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE;

  const host = req.get('host'); // may or may not include port
  let protocol = req.protocol; // http or https

  const actualPort = req.socket.localPort;
  const hasPort = host.includes(':');

  const needsPort =
    !hasPort &&
    ((protocol === 'http' && actualPort !== 80) ||
      (protocol === 'https' && actualPort !== 443));
  const fullHost = needsPort ? `${host}:${actualPort}` : host;
  protocol = req.secure ? 'https' : protocol;

  const dynamicSpec = {
    ...swaggerSpec,
    servers: [
      {
        url: preferredServerUrl || `${protocol}://${fullHost}`,
      },
    ],
  };

  swaggerUi.setup(dynamicSpec)(req, res, next);
});

// Parse JSON request body
app.use(express.json());

// Mount routes
app.use('/', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
});

module.exports = app;
