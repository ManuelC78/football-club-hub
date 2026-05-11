const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const authRoutes     = require('./routes/auth.routes');
const clubRoutes     = require('./routes/club.routes');
const playerRoutes   = require('./routes/player.routes');
const sessionRoutes  = require('./routes/session.routes');
const fixtureRoutes  = require('./routes/fixture.routes');
const billingRoutes  = require('./routes/billing.routes');
const uploadRoutes   = require('./routes/upload.routes');

const { errorHandler } = require('./middleware/error.middleware');
const { notFound }     = require('./middleware/notFound.middleware');

const app = express();

// ── Security ────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  credentials: true,
}));

// ── Rate limiting ─────────────────────────────────────────
app.use('/api/', rateLimit({ windowMs: 15*60*1000, max: 100 }));

// ── Stripe webhook needs raw body — register BEFORE express.json
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));

// ── Body parsing ─────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ──────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// ── Serve local uploads in dev ────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  const uploadDir = '/tmp/fch-uploads';
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  app.use('/uploads', express.static(uploadDir));
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
app.use('/api/billing',  billingRoutes);
app.use('/api/upload',   uploadRoutes);

// ── Error handling ───────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
