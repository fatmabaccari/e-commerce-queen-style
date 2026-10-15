import express from 'express';
import { adminLogin } from '../controllers/adminAuth.controller.js';

const router = express.Router();

router.post('/login', adminLogin);

export default router;
// routes/admin.routes.js
/*
import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Route admin seulement
router.get('/stats', authenticate, authorize(['admin']), (req, res) => {
    console.log(' /stats accessed by userId:', req.user.userId);
    console.log('   User role:', req.user.role ? req.user.role.name : 'Unknown');
    res.json({ message: 'Admin stats page' });
});

// Route pour tous les utilisateurs authentifiés
router.get('/profile', authenticate, (req, res) => {
    console.log('/profile accessed by userId:', req.user.userId);
    res.json({ message: 'User profile page', userId: req.user.userId });
});

export default router;
*/