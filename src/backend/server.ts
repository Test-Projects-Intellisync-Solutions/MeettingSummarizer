import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

// Resolve the directory path for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verbose environment variable loading
console.log('🔍 Environment Variable Loading:');
console.log('Current Working Directory:', process.cwd());
console.log('__dirname:', __dirname);

// Explicitly load environment variables from multiple potential locations
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../.env')
];

let loadedEnvFile = false;
for (const envPath of envPaths) {
  try {
    const result = dotenv.config({ path: envPath });
    if (!result.error) {
      console.log(`✅ Successfully loaded environment variables from: ${envPath}`);
      loadedEnvFile = true;
      break;
    }
  } catch (error) {
    console.error(`❌ Error loading .env from ${envPath}:`, error);
  }
}

if (!loadedEnvFile) {
  console.error('❌ Could not load any .env file');
}

// Log loaded environment variables
console.log('🔑 Loaded Environment Variables:');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET');

const app = express();
const DEFAULT_PORT = 5001;
const PORT = parseInt(process.env.PORT || `${DEFAULT_PORT}`, 10);

// Logging middleware
app.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.path}`);
  console.log('Request headers:', req.headers);
  next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer for handling multipart/form-data
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB file size limit
});

// Import routes
import submitNotesRoute from './routes/submitNotes';
import uploadDocumentRoute from './routes/uploadDocument';
import generateSummaryRoute from './routes/generateSummary';
import feedbackRoute from './routes/feedback';
import extractActionItemsRouter from './routes/extractActionItems';

// Use routes with base path and multer middleware
app.use('/api/submit-notes', submitNotesRoute);
app.use('/api/upload-document', uploadDocumentRoute);
app.use('/api/generate-summary', upload.array('documents'), generateSummaryRoute);
app.use('/api/feedback', feedbackRoute);
app.use('/api/extract-action-items', extractActionItemsRouter);


// Root route for health check
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Meeting Maestro Backend is running',
    environment: process.env.NODE_ENV || 'development',
    apiKeySet: !!process.env.OPENAI_API_KEY
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({
    error: 'Something went wrong',
    message: err.message
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment variables:', {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Set' : 'Not Set'
  });
});

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is busy, trying another port...`);
    setTimeout(() => {
      server.close();
      server.listen(0); // Let the OS assign a random available port
    }, 1000);
  } else {
    console.error('Server error:', error);
  }
});

server.on('listening', () => {
  const address = server.address();
  const port = typeof address === 'object' ? address?.port : address;
  console.log(`Server is now running on port ${port}`);
});
