import mongoose from 'mongoose';
import { logger } from '../../utils/logger';

export let isMongoConnected = false;
export let mongoConnectionError: string | null = null;

const SRV_URI = process.env.MONGO_URI || process.env.MONGODB_URI || '';
const DIRECT_URI = process.env.MONGO_DIRECT_URI || '';

function connectionCandidates(uri?: string): string[] {
  const candidates: string[] = [];
  if (uri) candidates.push(uri);
  if (SRV_URI && !candidates.includes(SRV_URI)) candidates.push(SRV_URI);
  if (DIRECT_URI && !candidates.includes(DIRECT_URI)) candidates.push(DIRECT_URI);
  return candidates;
}

export async function connectToMongo(uri?: string): Promise<boolean> {
  const candidates = connectionCandidates(uri);

  if (candidates.length === 0) {
    logger.warn('MONGO_URI not provided — running on in-memory database fallback.');
    isMongoConnected = false;
    return false;
  }

  mongoose.set('strictQuery', true);
  const connectionOpts = {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10
  };

  for (const candidate of candidates) {
    try {
      await mongoose.connect(candidate, connectionOpts);
      isMongoConnected = true;
      mongoConnectionError = null;
      const dbName = candidate.split('/').pop()?.split('?')[0] || '(default)';
      logger.info(`Connected to MongoDB Cloud (Atlas) successfully. Database: ${dbName}`);
      return true;
    } catch (err: any) {
      const msg = err?.message || String(err);
      logger.error(
        `MongoDB connection attempt failed (${candidate === SRV_URI ? 'SRV' : candidate === DIRECT_URI ? 'direct' : 'custom'}): ${msg}`
      );
      mongoConnectionError = msg;
    }
  }

  logger.error('All MongoDB connection attempts failed — falling back to in-memory database.');
  isMongoConnected = false;
  return false;
}

export async function disconnectFromMongo(): Promise<void> {
  if (isMongoConnected) {
    await mongoose.disconnect();
    isMongoConnected = false;
    logger.info('Disconnected from MongoDB.');
  }
}

export function isMongoReady(): boolean {
  return isMongoConnected && mongoose.connection.readyState === 1;
}