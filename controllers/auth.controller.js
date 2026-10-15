/*import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model.js';
import AdminModel from '../models/admin.model.js';
import AppError from '../middlewares/AppError.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/env.js';

export const signUp = async (req, res, next) => {
    try {
        // Extract user data from request body (already validated by middleware)
        const { first_name, last_name, email, password, phone } = req.body;

        // Check if user already exists
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            throw new AppError('User with this email already exists', 409);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = await UserModel.create({
            first_name,
            last_name,
            email,
            password_hash,
            phone: phone || null,
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser.id },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN || '7d' }
        );

        // Remove password_hash from response
        const { password_hash: _, ...userWithoutPassword } = newUser;

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                token,
                user: userWithoutPassword,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const signIn = async (req, res, next) => {
    try {
        // Extract credentials (already validated by middleware)
        const { email, password } = req.body;

        // Check if user exists
        let user = await UserModel.findByEmail(email);
        let isAdmin = false;

        // If not a user, check if it's an admin
        if (!user) {
            const admin = await AdminModel.findByEmail(email);
            if (admin) {
                user = admin;
                isAdmin = true;
            } else {
                throw new AppError('Invalid email or password', 401);
            }
        }

        // Check if password is correct
        const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordCorrect) {
            throw new AppError('Invalid email or password', 401);
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN || '7d' }
        );

        // Remove password_hash from response
        const { password_hash: _, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            message: isAdmin ? 'Admin logged in successfully' : 'User logged in successfully',
            data: {
                token,
                user: userWithoutPassword,
                isAdmin,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const signOut = async (req, res, next) => {
    try {
        // User is already authenticated (middleware ensures this)
        // For JWT tokens, sign-out is primarily client-side (remove token from storage)
        // However, we can:
        // 1. Clear any cookies if using cookie-based auth
        // 2. Optionally implement token blacklisting (requires storing tokens in DB/Redis)
        // 3. Log the sign-out event

        // Clear any authentication cookies if they exist
        res.clearCookie('token');
        res.clearCookie('authToken');

        // Optional: You could implement token blacklisting here
        // For now, we'll just return success - client should remove token from storage
        // If you want to implement token blacklisting, you would:
        // 1. Store the token in a blacklist table/Redis
        // 2. Check blacklist in authenticate middleware
        // 3. Add token to blacklist here

        res.status(200).json({
            success: true,
            message: 'User signed out successfully',
        });
    } catch (error) {
        next(error);
    }
};*/
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model.js';
import AdminModel from '../models/admin.model.js';
import AppError from '../middlewares/AppError.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/env.js';

console.log('🔧 [auth.controller] Initialisation du contrôleur d\'authentification');

export const signUp = async (req, res, next) => {
    console.log('👤 [auth.controller] signUp - Début');
    try {
        const { first_name, last_name, email, password, phone } = req.body;
        
        console.log('📝 [auth.controller] Données d\'inscription:', {
            email,
            first_name,
            last_name,
            phone,
            passwordLength: password?.length
        });

        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            console.log(' [auth.controller] Utilisateur existe déjà:', email);
            throw new AppError('User with this email already exists', 409);
        }

        console.log(' [auth.controller] Hashage du mot de passe');
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        console.log(' [auth.controller] Création du nouvel utilisateur');
        const newUser = await UserModel.create({
            first_name,
            last_name,
            email,
            password_hash,
            phone: phone || null,
        });

        console.log('✅ [auth.controller] Utilisateur créé avec ID:', newUser.id);

        const tokenPayload = {
            userId: newUser.id,
            role: 'user',
            isAdmin: false
        };

        const token = jwt.sign(
            tokenPayload,
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN || '7d' }
        );

        console.log('🎫 [auth.controller] Token JWT généré:', {
            userId: newUser.id,
            role: 'user',
            tokenLength: token.length
        });

        const { password_hash: _, ...userWithoutPassword } = newUser;

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                token,
                user: userWithoutPassword,
            },
        });
        
        console.log('✅ [auth.controller] signUp - Terminé avec succès');
    } catch (error) {
        console.error('❌ [auth.controller] signUp - Erreur:', error.message);
        next(error);
    }
};

export const signIn = async (req, res, next) => {
    console.log('🔑 [auth.controller] signIn - Début');
    try {
        const { email, password } = req.body;
        
        console.log('📝 [auth.controller] Tentative de connexion pour:', email);
        console.log('🔒 [auth.controller] Longueur du mot de passe:', password?.length);

        let user = await UserModel.findByEmail(email);
        let isAdmin = false;
        let adminId = null;

        if (!user) {
            console.log('👤 [auth.controller] Utilisateur non trouvé, recherche admin...');
            const admin = await AdminModel.findByEmail(email);
            if (admin) {
                console.log('👑 [auth.controller] Admin trouvé:', admin.email);
                user = admin;
                isAdmin = true;
                adminId = admin.id;
            } else {
                console.log('❌ [auth.controller] Aucun utilisateur/admin trouvé pour:', email);
                throw new AppError('Invalid email or password', 401);
            }
        } else {
            console.log('👤 [auth.controller] Utilisateur trouvé:', user.email);
        }

        console.log('🔍 [auth.controller] Vérification du mot de passe');
        const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordCorrect) {
            console.log('❌ [auth.controller] Mot de passe incorrect pour:', email);
            throw new AppError('Invalid email or password', 401);
        }

        console.log('✅ [auth.controller] Authentification réussie');
        
        // Ajouter le rôle dans le JWT
        const tokenPayload = {
            userId: user.id,
            role: isAdmin ? 'admin' : 'user',
            isAdmin: isAdmin,
            adminId: isAdmin ? adminId : null
        };

        const token = jwt.sign(
            tokenPayload,
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN || '7d' }
        );

        console.log('🎫 [auth.controller] Token JWT généré:', {
            userId: user.id,
            role: isAdmin ? 'admin' : 'user',
            isAdmin,
            tokenLength: token.length
        });

        const { password_hash: _, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            message: isAdmin ? 'Admin logged in successfully' : 'User logged in successfully',
            data: {
                token,
                user: userWithoutPassword,
                isAdmin,
            },
        });
        
        console.log('✅ [auth.controller] signIn - Terminé avec succès');
    } catch (error) {
        console.error('❌ [auth.controller] signIn - Erreur:', error.message);
        next(error);
    }
};

// AJOUTER CETTE FONCTION SIGN-OUT
export const signOut = async (req, res, next) => {
    console.log('🚪 [auth.controller] signOut - Début');
    try {
        console.log('👤 [auth.controller] Déconnexion pour userId:', req.user?.userId);
        
        // Pour JWT, la déconnexion est principalement côté client
        // Mais on peut :
        // 1. Effacer les cookies d'authentification
        // 2. Optionnellement implémenter une blacklist de tokens
        
        console.log('🍪 [auth.controller] Effacement des cookies d\'authentification');
        res.clearCookie('token');
        res.clearCookie('authToken');
        
        // Si vous voulez implémenter une blacklist de tokens, vous pouvez :
        // 1. Stocker le token dans une table blacklist/Redis
        // 2. Vérifier la blacklist dans le middleware d'authentification
        // 3. Ajouter le token à la blacklist ici
        
        console.log('✅ [auth.controller] Cookies effacés');
        
        res.status(200).json({
            success: true,
            message: 'User signed out successfully',
        });
        
        console.log('✅ [auth.controller] signOut - Terminé avec succès');
    } catch (error) {
        console.error('❌ [auth.controller] signOut - Erreur:', error.message);
        next(error);
    }
};

console.log('✅ [auth.controller] Contrôleur d\'authentification initialisé');