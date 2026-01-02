require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') }); // ✅ ADD THIS LINE FIRST!

const { Worker } = require('bullmq');
const Redis = require('ioredis');
const emailService = require('../utils/emailService');

console.log('🔍 Redis URL:', process.env.REDIS_URL ? 'Found ✅' : 'Missing ❌'); // ✅ DEBUG LINE

const connection = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
});

const worker = new Worker('email-queue', async (job) => {
    console.log(`🚀 Job ${job.id} started...`);
    
    await emailService.sendPaymentConfirmation(job.data.email, {
        amount: job.data.amount,
        paymentId: job.data.paymentId,
        orderId: job.data.orderId,
        donorName: job.data.donorName,
        campaignName: job.data.campaignName,
        method: job.data.method
    });
    
    console.log(`✅ Email sent to ${job.data.email} for ₹${job.data.amount}`);
}, { connection, concurrency: 5 });

worker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job.id} failed:`, err.message);
});

console.log('👂 Email worker listening...');
