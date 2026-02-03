import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../modules/user/user.model';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error('Google OAuth environment variables not configured');
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL, // Env-driven
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        
        if (!email) {
          return done(new Error('Google account has no email'), undefined);
        }

        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.findOne({ email });

          if (user) {
            // Link existing account
            user.googleId = profile.id;
            user.isVerified = true; // Trust Google verification
            await user.save();
          } else {
            // Create new account
            user = await User.create({
              googleId: profile.id,
              email,
              name: profile.displayName,
              isVerified: true,
            });
          }
        }
        
        // Return minimal payload
        return done(null, { 
          _id: user._id.toString(), 
          role: user.role 
        });
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);
