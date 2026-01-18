import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { Queue } from 'bullmq';
import dotenv from 'dotenv';
import JobLink from './models/JobLink';

// Bull Board Imports
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// 1. Database Connection
mongoose.connect(process.env.MONGO_URI!)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ DB Error:', err));

// 2. Setup BullMQ & Bull Board
const connection = { host: '127.0.0.1', port: 6379 };
export const jobQueue = new Queue('link-checker', { connection });

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullMQAdapter(jobQueue)],
  serverAdapter: serverAdapter,
});

// Admin UI Route
app.use('/admin/queues', serverAdapter.getRouter());

// 3. API Routes

// API: Add Link to Queue
app.post('/api/check', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL required' });

    // Upsert the record as 'pending'
    await JobLink.findOneAndUpdate(
      { url }, 
      { status: 'pending', checkedAt: new Date() }, 
      { upsert: true }
    );

    // Add to Queue with retry logic (3 attempts if scraping fails)
    const job = await jobQueue.add('scrape-job', { url }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 }
    });

    res.json({ id: job.id, status: 'pending' });
  } catch (err) {
    next(err); // Pass to global error handler
  }
});

// API: Fetch History
app.get('/api/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const history = await JobLink.find().sort({ checkedAt: -1 }).limit(50);
    res.json(history);
  } catch (err) {
    next(err);
  }
});

// 4. Global Error Handler (The Professional Way)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Sentinel API: http://localhost:${PORT}`);
  console.log(`📊 Bull Board UI: http://localhost:${PORT}/admin/queues`);
});