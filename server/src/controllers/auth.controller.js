const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// In a real app these would hit the DB — stubbed for scaffold
const users = [];

const generateTokens = (user) => {
  const access = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
  const refresh = jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
  return { access, refresh };
};

exports.register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (users.find(u => u.email === email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 12);
    const user = { id: uuidv4(), email, password: hashed, name, role: 'manager' };
    users.push(user);
    const tokens = generateTokens(user);
    res.status(201).json({ user: { id: user.id, email, name, role: user.role }, ...tokens });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const tokens = generateTokens(user);
    res.json({ user: { id: user.id, email, name: user.name, role: user.role }, ...tokens });
  } catch (err) { next(err); }
};

exports.refresh = (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = users.find(u => u.id === decoded.id);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    const tokens = generateTokens(user);
    res.json(tokens);
  } catch (err) { next(err); }
};

exports.logout = (req, res) => {
  // In production: invalidate refresh token in DB/Redis
  res.json({ message: 'Logged out successfully' });
};
