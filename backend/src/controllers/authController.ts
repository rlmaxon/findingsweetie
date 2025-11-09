import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { body, validationResult } from 'express-validator';
import type { StringValue } from 'ms';

export const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('phone').optional().trim()
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password, firstName, lastName, phone } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    // Create new user
    const user = await UserModel.create(email, password, firstName, lastName, phone);

    // Generate JWT token
    const secret: string = process.env.JWT_SECRET || 'your_jwt_secret_here_change_in_production';
    const options: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as StringValue
    };
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      secret,
      options
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    // Verify credentials
    const user = await UserModel.verifyPassword(email, password);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (!user.is_active) {
      res.status(403).json({ error: 'Account is deactivated' });
      return;
    }

    // Generate JWT token
    const secret: string = process.env.JWT_SECRET || 'your_jwt_secret_here_change_in_production';
    const options: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as StringValue
    };
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      secret,
      options
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        emailVerified: user.email_verified
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
