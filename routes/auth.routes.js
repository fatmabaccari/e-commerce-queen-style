import { Router } from "express";
import { signUp, signIn, signOut } from "../controllers/auth.controller.js";
import { validateSignUp, validateSignIn } from "../middlewares/validation.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const authRouter = Router();

// Path: /api/v1/auth/sign-up -> POST
// Public route - no authentication required
authRouter.post('/sign-up', validateSignUp, asyncHandler(signUp));

// Path: /api/v1/auth/sign-in -> POST
// Public route - no authentication required
authRouter.post('/sign-in', validateSignIn, asyncHandler(signIn));

// Path: /api/v1/auth/sign-out -> POST
// Protected route - requires authentication
authRouter.post('/sign-out', authenticate, asyncHandler(signOut));

export default authRouter;