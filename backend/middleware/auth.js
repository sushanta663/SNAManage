const jwt = require('jsonwebtoken');

// auth() = any logged-in user, auth('hod') = only HOD, auth('faculty','hod') = either
module.exports = (...roles) => (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Please login first' });
  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Session expired, please login again' });
  }
  if (roles.length && !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'You are not allowed to do this' });
  }
  next();
};
