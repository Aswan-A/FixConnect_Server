import type { Request, Response } from 'express';
import User from '../models/User.js';
import ProUser from '../models/proUser.js';
import type { AuthenticatedRequest } from '../middlewares/authMiddleware.js';


export const updateProUser = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  const userId = req.user?.id; 
  const updates = req.body;

  try {
    const proUser = await ProUser.findOne({ userID: userId });
    if (!proUser) {
      return res.status(404).json({ message: 'Professional user not found' });
    }

    Object.keys(updates).forEach((key) => {
      if (key in proUser) {
        (proUser as any)[key] = updates[key];
      }
    });

    await proUser.save();
    return res.status(200).json({ message: 'Professional user updated successfully', proUser });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating professional user', error });
  }
};

export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    const user = await User.findById(userId).select('-password'); 
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const proUser = await ProUser.findOne({ userID: userId }); 

    return res.status(200).json({
      message: 'User profile fetched successfully',
      user,
      proUser: proUser || null,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching profile', error });
  }
};

export const getUser = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    const user = await User.findById(userId).select('profilePic name');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const proUser = await ProUser.findOne({ userID: userId });

    return res.status(200).json({
      message: 'User profile fetched successfully',
      user,
      proUser: proUser || null,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching profile', error });
  }
};
