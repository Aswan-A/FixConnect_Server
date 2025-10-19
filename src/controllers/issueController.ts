import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/authMiddleware.js";
import Issue from "../models/Issue.js";
import supabase from "../config/config.js";
import IssueRequest from "../models/IssueRequest.js";
import geocoding from "@aashari/nodejs-geocoding";

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
      return res.status(400).json({
        error: "Title, description, latitude, and longitude are required",
      });
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

export const getIssueById = async (req: Request, res: Response) => {
  try {
    const { issueId } = req.params;
    
    const issue = await Issue.findById(issueId)
      .populate("reportedBy", "name")
      .select(
        "title description images createdAt location category status reportedBy"
      );

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    let address: string | undefined = undefined;

    if (issue.location?.coordinates.length === 2) {
      const [lng, lat] = issue.location.coordinates;
      if (lng !== undefined && lat !== undefined) {
        const geocodeResult = await geocoding.decode(lat, lng);
        address = geocodeResult?.formatted_address;
      }
    }

    const issueObject = issue.toObject();

    delete issueObject.location;

    return res.json({ ...issueObject, address });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch issue details" });
  }
};


export const requestIssue = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { issueId } = req.params;

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    const existingRequest = await IssueRequest.findOne({
      userId: req.user.id,
      issueId: issue._id,
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ error: "You have already requested this issue" });
    }

    const issueRequest = await IssueRequest.create({
      userId: req.user.id,
      issueId: issue._id,
    });

    res.status(201).json({
      message: "Request submitted successfully",
      request: {
        id: issueRequest._id,
        issueId: issueRequest.issueId,
        userId: issueRequest.userId,
        createdAt: issueRequest.createdAt,
      },
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Failed to submit request" });
  }
};

export const getUserIssues = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const issues = await Issue.find({ reportedBy: req.user.id })
      .populate("reportedBy", "name email phoneNumber")
      .select("-__v");

    res.json(issues);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user issues" });
  }
};

export const getRequestsForUserIssues = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const userIssues = await Issue.find({ reportedBy: req.user.id }).select(
      "_id"
    );
    const issueIds = userIssues.map((issue) => issue._id);

    const requests = await IssueRequest.find({ issueId: { $in: issueIds } })
      .populate("userId", "name email phoneNumber")
      .populate("issueId", "title description images category status")
      .select("-__v");

    res.json(requests);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};

export const updateIssueStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { issueId } = req.params;
    const { status } = req.body;

    if (!["open", "in progress", "resolved"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    if (!issue.reportedBy || issue.reportedBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You are not authorized to update this issue" });
    }

    issue.status = status;
    await issue.save();

    res.json({
      message: "Issue status updated successfully",
      issue: {
        id: issue._id,
        title: issue.title,
        status: issue.status,
        updatedAt: new Date(),
      },
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Failed to update issue status" });
  }
};
