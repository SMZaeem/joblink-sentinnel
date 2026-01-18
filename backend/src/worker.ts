import { Worker, Job } from 'bullmq';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import JobLink from './models/JobLink';

dotenv.config();
puppeteer.use(StealthPlugin());

const connection = { host: '127.0.0.1', port: 6379 };

// 1. Connect to MongoDB (The Worker needs its own connection)
mongoose.connect(process.env.MONGO_URI!)
  .then(() => console.log('✅ Worker connected to MongoDB'))
  .catch(err => console.error('❌ Worker DB Connection Error:', err));

const worker = new Worker('link-checker', async (job: Job) => {
  const { url } = job.data;
  console.log(`🔍 Job ${job.id}: Checking link: ${url}`);

  // Update status to 'processing' so the UI can show a spinner
  await JobLink.findOneAndUpdate({ url }, { status: 'processing' });

  const browser = await puppeteer.launch({ 
    headless: true, // Use "true" for production, "false" for debugging
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });

  try {
    const page = await browser.newPage();
    
    // Set a realistic viewport and User Agent
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    
    // 1. Navigate to URL
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // 2. Extract Data (Status + Company Name)
    const pageData = await page.evaluate(() => {
      const bodyText = document.body.innerText.toLowerCase();
      
      // Try to find a company name in the <title> or meta tags
      const title = document.title;
      const metaTitle = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
      
      return {
        bodyText,
        title: metaTitle || title || "Unknown Company"
      };
    });

    const expiredKeywords = [
      'no longer accepting', 'expired', 'closed', '404 not found', 'unavailable', 'sorry', 'does not exist', 'oops', 'doesn\'t exist', 'The page you are looking for'
    ];
    
    const isExpired = expiredKeywords.some(keyword => pageData.bodyText.includes(keyword));
    const status = isExpired ? 'expired' : 'live';

    // 3. Update the Database with the result and the scraped company name
    await JobLink.findOneAndUpdate(
      { url }, 
      { 
        status, 
        company: pageData.title.split('|')[0].split('-')[0].trim(), // Clean up title (e.g., "Software Engineer - Google" -> "Google")
        checkedAt: new Date() 
      }
    );

    console.log(`🎯 Job ${job.id} Complete: ${status}`);
    return { status, company: pageData.title };

  } catch (error: any) {
    console.error(`❌ Worker Error for ${url}:`, error.message);
    
    // If it's the last attempt, mark as error. Otherwise, BullMQ will retry.
    if (job.attemptsMade === (job.opts.attempts || 1) - 1) {
      await JobLink.findOneAndUpdate({ url }, { status: 'error' });
    }
    
    throw error; // Rethrow so BullMQ knows the job failed
  } finally {
    await browser.close();
  }
}, { 
  connection, 
  concurrency: 2, // Process 2 links at a time
  limiter: {
    max: 10,
    duration: 10000 // Limit to 10 jobs every 10 seconds to avoid being blocked
  }
});

worker.on('failed', (job, err) => {
  console.error(`🚨 Job ${job?.id} failed permanently: ${err.message}`);
});

console.log('👷 Worker started and listening for jobs...');