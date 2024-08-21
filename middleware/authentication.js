const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
require('dotenv').config();


// Middleware to authenticate requests using Clerk
const authenticateRequest = ClerkExpressRequireAuth({
  apiKey: process.env.CLERK_API_KEY
});

module.exports = authenticateRequest;
