import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import type { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import ProUser from "../models/proUser.js";
import supabase from '../config/config.js';
import path from 'path';

// Register
export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email, password, phoneNumber, isPro } = req.body;

    if (!name || !email || !password || !phoneNumber) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let profilePicUrl: string | null = null;

    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const uniqueName = `profile-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

      const { error } = await supabase.storage
        .from("profile-pics") 
        .upload(uniqueName, req.file.buffer, {
          contentType: req.file.mimetype,
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Supabase upload error:", error);
        return res.status(500).json({ message: "Error uploading profile picture" });
      }

      const { data: publicUrlData } = supabase.storage
        .from("profile-pics")
        .getPublicUrl(uniqueName);

      profilePicUrl = publicUrlData.publicUrl;
    }

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      profilePic: profilePicUrl, 
      isPro: isPro || false,
    });

    const payload = { id: newUser._id, email: newUser.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return res.status(201).json({
      message: "User registered",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        profilePic: newUser.profilePic,
        isPro: newUser.isPro,
      },
      tokens: { accessToken, refreshToken },
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
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

    const payload = { id: user._id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return res.status(200).json({
      message: 'Login successful',
      user: { id: user._id, email: user.email },
      tokens: { accessToken, refreshToken }
    });
  } catch (error: any) {
    return res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

export const refresh = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    const accessToken = generateAccessToken({ 
      id: (decoded as any).id, 
      email: (decoded as any).email 
    });

    return res.json({ accessToken });
  } catch (error: any) {
    return res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
};


export const proRegister = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { occupation, skill, degree, description } = req.body;

    // Check if already pro
    const existing = await ProUser.findOne({ userID: req.user.id });
    if (existing) {
      return res.status(400).json({ error: "User already registered as pro user" });
    }

    let certificates: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      certificates = req.files.slice(0, 3).map((file: any) => `/certificates/${file.filename}`);
    }

    const proUser = new ProUser({
      userID: req.user.id,
      occupation,
      skill: skill ? (Array.isArray(skill) ? skill : [skill]) : [],
      degree,
      certifications: certificates,
      description,
    });

    await proUser.save();

    await User.findByIdAndUpdate(req.user.id, { isPro: true });

    res.status(201).json({
      message: "Pro user registered successfully",
      proUser: {
        occupation: proUser.occupation,
        skill: proUser.skill,
        degree: proUser.degree,
        certifications: proUser.certifications,
        description: proUser.description,
      },
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Failed to register pro user", message: error.message });
  }
};