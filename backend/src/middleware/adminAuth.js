import { config } from '../config.js';

export function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${config.adminSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}
