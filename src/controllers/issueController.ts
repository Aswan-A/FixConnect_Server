import type { Request, Response } from 'express';
import type {AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import Issue from '../models/Issue.js';
import supabase from '../config/config.js';

export const getIssues = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius } = req.query;

    if (!latitude || !longitude || !radius) {
      return res
        .status(400)
        .json({ error: "Latitude, longitude, and radius are required" });
    }

    const radiusInMeters = Number(radius) * 1000;

    const issues = await Issue.find({
      status: "open",
      location: {
        $geoWithin: {
          $centerSphere: [
            [Number(longitude), Number(latitude)],
            radiusInMeters / 6378137, 
          ],
        },
      },
    }).select("images title description createdAt location category status");

    res.json(issues);
  } catch (error: any) {
    console.error("Error fetching issues:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch issues", message: error.message });
  }
};



export const createIssue = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, latitude, longitude, category } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!title || !description || !latitude || !longitude) {
      return res
        .status(400)
        .json({ error: "Title, description, latitude, and longitude are required" });
    }

    let imageUrls: string[] = [];

    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files as Express.Multer.File[]) {
        const folder = `issues/${req.user.id}`; 
        const uniqueName = `${folder}/${Date.now()}-${file.originalname}`;

        const { error } = await supabase.storage
          .from("issue-images") 
          .upload(uniqueName, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (error) {
          console.error("Supabase upload error:", error);
          return res.status(500).json({ error: "Error uploading images" });
        }

        const { data: publicUrlData } = supabase.storage
          .from("issue-images")
          .getPublicUrl(uniqueName);

        imageUrls.push(publicUrlData.publicUrl);
      }
    }

    const issue = new Issue({
      title,
      description,
      images: imageUrls, 
      category,
      reportedBy: req.user.id,
      location: {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
      },
    });

    await issue.save();

    res.status(201).json({
      id: issue._id,
      title: issue.title,
      description: issue.description,
      images: issue.images,
      category: issue.category,
      location: issue.location,
      createdAt: issue.createdAt,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Failed to create issue" });
  }
};
