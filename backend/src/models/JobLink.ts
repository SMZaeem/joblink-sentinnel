import mongoose, { Schema, Document } from 'mongoose';

// 1. Define the interface for TypeScript
export interface IJobLink extends Document {
  url: string;
  company: string;
  status: 'pending' | 'processing' | 'live' | 'expired' | 'error';
  checkedAt: Date;
}

// 2. Define the Schema for MongoDB
const JobLinkSchema: Schema = new Schema({
  url: { type: String, required: true, unique: true },
  company: { type: String, default: 'Unknown Company' },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'live', 'expired', 'error'], 
    default: 'pending' 
  },
  checkedAt: { type: Date, default: Date.now }
});

// 3. Export the Model
// This "JobLink" is what you were missing in server.ts
const JobLink = mongoose.model<IJobLink>('JobLink', JobLinkSchema);
export default JobLink;