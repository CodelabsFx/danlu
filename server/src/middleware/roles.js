function requireRole(role) {
  return function (req, res, next) {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    // allow if user's role matches or if user is owner
    if (user.role === role || user.role === 'owner') return next();
    return res.status(403).json({ message: 'Forbidden: insufficient role' });
  }
}

module.exports = { requireRole };
