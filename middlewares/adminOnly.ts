import { authenticate, authorize } from './auth.middleware.js';

const adminOnly = [
  authenticate,
  authorize(['admin', 'super_admin']),
];

export default adminOnly;
