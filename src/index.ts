import 'dotenv/config';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // allow frontend requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || '', {
    dbName: 'FixConnect', // change DB name if you want
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Issue Schema & Model
const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: String,
});

const Issue = mongoose.model('Issue', issueSchema, 'Issues');

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello, TypeScript Express!' });
});
app.get('/seed', async (req: Request, res: Response) => {
  try {
    const sampleIssues = [
      {
        title: 'Pothole on Main Street',
        description: 'Large pothole near traffic light',
        image: 'https://via.placeholder.com/150',
      },
      {
        title: 'Streetlight not working',
        description: 'Lamp post #23 on Oak Road is out',
        image: 'https://via.placeholder.com/150',
      },
    ];
    await Issue.insertMany(sampleIssues);
    res.json({ message: 'Sample issues inserted!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to seed database' });
  }
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get all issues
app.get('/api/issues', async (req: Request, res: Response) => {
  try {
    const issues = await Issue.find();
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

// Add new issue
app.post('/api/issues', async (req: Request, res: Response) => {
  try {
    const { title, description, image } = req.body;
    const newIssue = new Issue({ title, description, image });
    await newIssue.save();
    res.status(201).json(newIssue);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create issue' });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
