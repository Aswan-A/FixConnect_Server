import  type { Request, Response } from 'express';
import User from '../models/User.js';
import ProUser from '../models/proUser.js';

export const updateIsPro = async (req: Request, res: Response) => {
  const { userId, isPro } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isPro = isPro;
    await user.save();

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
};


export const updateProUser = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const proUser = await ProUser.findById(id);
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


export const getUserProfile = async (req: Request, res: Response) => {
  const { userId } = req.params; // assume frontend passes /profile/:userId

  try {
    // Get the basic user info
    const user = await User.findById(userId).select('-password'); // exclude password
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get the professional details if the user is a pro
    const proUser = await ProUser.findOne({ userID: userId }); // assuming ProUser stores userID reference
    // if no proUser, it's fine; frontend can handle null

    return res.status(200).json({
      message: 'User profile fetched successfully',
      user,
      proUser: proUser || null,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching profile', error });
  }
};
