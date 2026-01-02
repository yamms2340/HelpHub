require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') }); // ✅ ADD THIS LINE FIRST!

const { Queue } = require('bullmq');
const Redis = require('ioredis');

const connection = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
});

const emailQueue = new Queue('email-queue', { 
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 }
    }
});

module.exports = emailQueue;
