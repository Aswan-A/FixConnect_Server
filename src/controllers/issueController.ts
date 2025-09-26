import type { Request, Response } from 'express';
import type {AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import Issue from '../models/Issue.js';

export const getIssues = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius } = req.query;

    if (!latitude || !longitude || !radius) {
      return res.status(400).json({ error: 'Latitude, longitude, and radius are required' });
    }

    const radiusInMeters = Number(radius) * 1000;

    const issues = await Issue.find({
      status: 'open',
      location: {
        $geoWithin: {
          $centerSphere: [
            [Number(longitude), Number(latitude)], 
            radiusInMeters / 6378137 
          ]
        }
      }
    }).select('image title description createdAt location category');

    res.json(issues);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch issues', message: error.message });
  }
};



export const createIssue = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, image, latitude, longitude, category } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!title || !description || !latitude || !longitude) {
      return res.status(400).json({ error: 'Title, description, latitude, and longitude are required' });
    }

    const issue = new Issue({
      title,
      description,
      image,
      category,
      reportedBy: req.user.id,
      location: {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)],
      },
    });

    await issue.save();

    res.status(201).json({
      title: issue.title,
      description: issue.description,
      image: issue.image,
      createdAt: issue.createdAt,
      location: issue.location,
      category: issue.category,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create issue' });
  }
};