const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes    = require('./routes/auth.routes');
const clubRoutes    = require('./routes/club.routes');
const playerRoutes  = require('./routes/player.routes');
const sessionRoutes = require('./routes/session.routes');
const fixtureRoutes = require('./routes/fixture.routes');

const { errorHandler } = require('./middleware/error.middleware');
const { notFound }     = require('./middleware/notFound.middleware');

const app = express();

// ── Security ────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  credentials: true,
}));

// ── Rate limiting ────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ── Body parsing ─────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ──────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Health check ─────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '0.1.0', timestamp: new Date().toISOString() });
});

// ── Routes ───────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/clubs',    clubRoutes);
app.use('/api/players',  playerRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/fixtures', fixtureRoutes);

// ── Error handling ───────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
