export const logger = {
  info: (msg: string, meta?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, meta ? JSON.stringify(meta) : '');
  },
  warn: (msg: string, meta?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, meta ? JSON.stringify(meta) : '');
  },
  error: (msg: string, meta?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, meta ? JSON.stringify(meta) : '');
  },
  audit: (action: string, userId: string, instituteId: string, details?: any) => {
    console.log(`[AUDIT LOG] [Institute: ${instituteId}] [User: ${userId}] - Action: ${action}`, details ? JSON.stringify(details) : '');
  }
};
