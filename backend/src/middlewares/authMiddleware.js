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

const generateUniqueUsername = async (clerkUser, clerkId) => {
  // 1. Try clerkUser.username first
  let baseUsername = clerkUser?.username || '';
  
  // 2. If no username, try firstName
  if (!baseUsername && clerkUser?.firstName) {
    baseUsername = clerkUser.firstName;
  }
  
  // 3. Fallback to email prefix or candidate
  if (!baseUsername) {
    if (clerkUser?.emailAddresses && clerkUser.emailAddresses.length > 0) {
      baseUsername = clerkUser.emailAddresses[0].emailAddress.split('@')[0];
    } else {
      baseUsername = 'candidate';
    }
  }

  // Clean the username: convert to lowercase, keep alphanumeric and hyphens
  baseUsername = baseUsername
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!baseUsername) baseUsername = 'candidate';

  let username = baseUsername;
  let counter = 1;
  
  // Keep checking until a unique username is found
  while (true) {
    const existing = await User.findOne({ username });
    if (!existing) {
      break;
    }
    username = `${baseUsername}-${counter}`;
    counter++;
  }
  
  return username;
};

const syncUser = async (req, res, next) => {
  try {
    const auth = req.auth;
    if (!auth || !auth.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let user = await User.findOne({ clerkId: auth.userId });
    let clerkUser = null;

    if (!user) {
      let email = `${auth.userId}@placeholder.com`;
      let name = '';
      
      try {
        clerkUser = await clerkClient.users.getUser(auth.userId);
        if (clerkUser) {
          if (clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0) {
            email = clerkUser.emailAddresses[0].emailAddress;
          }
          name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
        }
      } catch (clerkErr) {
        console.error('Error fetching user details from Clerk API:', clerkErr);
      }

      // Generate unique username
      const username = await generateUniqueUsername(clerkUser, auth.userId);

      user = await User.create({
        clerkId: auth.userId,
        email,
        name,
        username,
      });
    } else if (!user.username) {
      // For existing users who don't have username field yet
      try {
        clerkUser = await clerkClient.users.getUser(auth.userId);
      } catch (clerkErr) {
        console.error('Error fetching user details from Clerk API for existing user:', clerkErr);
      }
      
      const username = await generateUniqueUsername(clerkUser, auth.userId);
      user.username = username;
      await user.save();
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { syncUser, requireAuthMiddleware };
