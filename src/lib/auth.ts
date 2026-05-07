import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from './mongodb-adapter';
import { connectDB } from './db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

/**
 * NextAuth configuration options
 * Implements Google OAuth with JWT sessions and role-based access control
 */
export const authOptions: NextAuthOptions = {
  // Configure authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          await connectDB();
          
          // Find user with password field included
          const user = await User.findOne({ email: credentials.email }).select('+password');
          
          if (!user || !user.password) {
            throw new Error('Invalid email or password');
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            throw new Error('Invalid email or password');
          }

          // Return user object (password excluded)
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          throw new Error('Authentication failed');
        }
      },
    }),
  ],

  // Use MongoDB adapter for persisting users, accounts, and sessions
  adapter: MongoDBAdapter(clientPromise) as any,

  // Session configuration
  session: {
    strategy: 'jwt', // Use JWT for stateless sessions
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Custom pages
  pages: {
    signIn: '/login',
    error: '/login', // Redirect errors to login page
  },

  // Callbacks for customizing session and token behavior
  callbacks: {
    /**
     * JWT callback - runs when JWT is created or updated
     * Embeds user role and ID into the token
     */
    async jwt({ token, user, trigger }) {
      // On first sign-in, fetch user from database and embed role
      if (user) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: user.email });
          
          if (dbUser) {
            token.role = dbUser.role;
            token.userId = dbUser._id.toString();
          } else {
            // Default role if user not found in database
            token.role = 'user';
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          token.role = 'user'; // Fallback to user role
        }
      }

      // Handle session updates (e.g., role changes)
      if (trigger === 'update') {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            token.role = dbUser.role;
            token.userId = dbUser._id.toString();
          }
        } catch (error) {
          console.error('Error updating user role:', error);
        }
      }

      return token;
    },

    /**
     * Session callback - runs when session is checked
     * Exposes role and ID on the session object for client access
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.userId as string;
      }
      return session;
    },
  },

  // Enable debug messages in development
  debug: process.env.NODE_ENV === 'development',
};
