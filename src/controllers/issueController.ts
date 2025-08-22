import { Request, Response } from 'express';
import Issue from '../models/Issue';

export const getIssues = async (req: Request, res: Response) => {
  try {
    const issues = await Issue.find();
    res.json(issues);
  } catch {
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
};

export const createIssue = async (req: Request, res: Response) => {
  try {
    const { title, description, image } = req.body;
    const issue = new Issue({ title, description, image });
    await issue.save();
    res.status(201).json(issue);
  } catch {
    res.status(500).json({ error: 'Failed to create issue' });
  }
};
