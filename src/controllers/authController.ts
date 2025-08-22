import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';

// Register
export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });

    return res.status(201).json({
      message: 'User registered',
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (error: any) {
  return res.status(500).json({ 
    message: 'Server error', 
    error: error.message 
  });
}

};

// Login
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.status(200).json({
      message: 'Login successful',
      user: { id: user.id, email: user.email },
    });
  } catch (error: any) {
  return res.status(500).json({ 
    message: 'Server error', 
    error: error.message 
  });
}

};
