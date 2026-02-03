# Auth System Backend

Production-ready authentication system built with Node.js, Express, TypeScript, and MongoDB.

## Features

- ✅ **JWT Authentication** - Secure access & refresh token system
- ✅ **Email/Password Auth** - Traditional authentication with bcrypt hashing
- ✅ **Google OAuth 2.0** - Social authentication integration
- ✅ **Email Verification** - OTP-based email verification with Nodemailer
- ✅ **Session Management** - Redis-backed refresh token rotation
- ✅ **Rate Limiting** - Protection against brute force attacks
- ✅ **Security Hardened** - Helmet, CORS, input validation
- ✅ **Production Ready** - Comprehensive error handling & logging

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Cache**: Redis (ioredis)
- **Authentication**: Passport.js, JWT
- **Validation**: express-validator
- **Email**: Nodemailer
- **Logging**: Winston

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Redis server
- Gmail account with App Password (for email verification)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your values:
   - MongoDB connection string
   - JWT secret (use a strong random string)
   - Google OAuth credentials
   - Gmail SMTP credentials
   - Redis connection URL

4. **Start Redis server**
   ```bash
   redis-server
   ```

5. **Run in development mode**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
src/
├── common/           # Shared utilities and middleware
│   ├── constants/    # Application constants
│   ├── errors/       # Custom error classes
│   ├── helpers/      # Helper functions (JWT, password)
│   ├── middlewares/  # Express middlewares
│   ├── types/        # TypeScript type definitions
│   └── utils/        # Utility functions
├── config/           # Configuration files
│   ├── db.config.ts      # MongoDB connection
│   ├── redis.config.ts   # Redis connection
│   └── passport.config.ts # Passport strategies
├── modules/          # Feature modules
│   ├── user/         # User authentication
│   ├── session/      # Session management
│   └── email/        # Email verification
├── services/         # Business logic services
│   ├── email/        # Email service (Nodemailer)
│   └── otp/          # OTP generation & verification
├── routes/           # API route definitions
├── app.ts            # Express app configuration
└── server.ts         # Server entry point
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/profile` - Get user profile (protected)
- `GET /api/v1/auth/google` - Initiate Google OAuth
- `GET /api/v1/auth/google/callback` - Google OAuth callback

### Email Verification
- `POST /api/v1/email/send-verification` - Send verification OTP
- `POST /api/v1/email/verify-otp` - Verify OTP code
- `POST /api/v1/email/resend-otp` - Resend verification OTP

## Environment Variables

See `.env.example` for all required variables.

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Short-lived access tokens, httpOnly refresh tokens
- **CORS**: Configured for specific origins
- **Helmet**: Security headers
- **Rate Limiting**: OTP requests limited to 3 per hour
- **Input Validation**: express-validator on all endpoints
- **Error Handling**: No sensitive data leaked in errors

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production server
- `npm run lint` - Run ESLint (if configured)

## License

MIT

## Author

Your Name
