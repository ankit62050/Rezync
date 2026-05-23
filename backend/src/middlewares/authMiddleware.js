const User = require('../models/User');
const { clerkMiddleware, getAuth, createClerkClient } = require('@clerk/express');

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const requireAuthMiddleware = [
  clerkMiddleware(),
  (req, res, next) => {
    const auth = getAuth(req);
    if (!auth || !auth.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.auth = auth;
    next();
  }
];

const syncUser = async (req, res, next) => {
  try {
    const auth = req.auth;
    if (!auth || !auth.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let user = await User.findOne({ clerkId: auth.userId });

    if (!user) {
      let email = `${auth.userId}@placeholder.com`;
      let name = '';
      
      try {
        const clerkUser = await clerkClient.users.getUser(auth.userId);
        if (clerkUser) {
          if (clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0) {
            email = clerkUser.emailAddresses[0].emailAddress;
          }
          name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
        }
      } catch (clerkErr) {
        console.error('Error fetching user details from Clerk API:', clerkErr);
      }

      user = await User.create({
        clerkId: auth.userId,
        email,
        name,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { syncUser, requireAuthMiddleware };
