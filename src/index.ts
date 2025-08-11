import 'dotenv/config';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
// User Schema & Model
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // added name
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema, 'User');

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

// REGISTER


// REGISTER
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log('[REGISTER] Incoming data:', req.body);

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    console.log('[REGISTER] User created:', newUser);

    return res.status(201).json({ 
      message: 'User registered successfully', 
      user: { id: newUser._id, name: newUser.name, email: newUser.email }
    });
  } catch (error: any) {
    console.error('[REGISTER] Error:', error);

    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    return res.status(500).json({
      message: 'Server error',
      error: error.message || error
    });
  }
});



// LOGIN
app.post('/api/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // ✅ Respond with user data or token
    return res.status(200).json({
      message: 'Login successful',
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});



// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
