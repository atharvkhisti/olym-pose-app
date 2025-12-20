# Olym Pose - Frontend Web Application

AI-powered exercise pose detection and correction platform.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Database**: MongoDB Atlas (via Mongoose)
- **Authentication**: JWT (Access + Refresh tokens)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account

### Installation

1. **Clone the repository**
   ```bash
   cd frontend/web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in the required values:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A strong random string for access tokens
   - `JWT_REFRESH_SECRET`: A strong random string for refresh tokens

4. **Install Radix UI primitives (required for shadcn components)**
   ```bash
   npm install @radix-ui/react-label @radix-ui/react-separator @radix-ui/react-slot
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
frontend/web/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── api/auth/          # Auth API routes
│   ├── dashboard/         # Protected dashboard
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   ├── auth/              # Auth forms
│   ├── branding/          # Logo component
│   ├── layout/            # Navbar, Footer
│   └── ui/                # shadcn UI components
├── lib/
│   ├── auth.ts            # JWT utilities
│   ├── constants.ts       # App constants
│   ├── db.ts              # MongoDB connection
│   ├── utils.ts           # Utility functions
│   └── validators/        # Zod schemas
├── models/
│   └── User.ts            # Mongoose User model
├── store/
│   └── auth.store.ts      # Zustand auth store
├── styles/
│   └── globals.css        # Global styles
└── public/                # Static assets
```

## Features

### Authentication
- ✅ User registration with validation
- ✅ User login with JWT
- ✅ Access + Refresh token rotation
- ✅ Protected routes
- ✅ Secure httpOnly cookies
- ✅ Password hashing (bcrypt)

### UI/UX
- ✅ Dark modern theme
- ✅ Responsive design
- ✅ Animated transitions
- ✅ Form validation feedback
- ✅ Loading states

## Environment Variables

| Variable | Description |
|----------|-------------|
| `APP_ENV` | Environment (development/production) |
| `NEXT_PUBLIC_APP_NAME` | Application name |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `ACCESS_TOKEN_EXPIRES_IN` | Access token expiry (e.g., "15m") |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token expiry (e.g., "7d") |

## Future Integrations

<!-- TODO: Jenkins CI/CD pipeline configuration -->
<!-- TODO: FastAPI AI service integration -->

### AI Service (Planned)
The application is designed to integrate with a FastAPI backend for:
- Real-time pose detection
- Exercise form analysis
- Rep counting
- Progress tracking

### CI/CD (Planned)
Jenkins pipeline will be configured for:
- Automated testing
- Build verification
- Deployment automation

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## License

Private - All rights reserved.
