# LeadFlow CRM

A modern, full-stack Sales CRM application built with Next.js 15, TypeScript, and MongoDB. Features a beautiful UI with role-based access control, lead management, pipeline tracking, and analytics.

![LeadFlow CRM](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-7-green?style=for-the-badge&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-cyan?style=for-the-badge&logo=tailwindcss)

## ✨ Features

### 🔐 Authentication & Authorization
- **Dual Authentication**: Email/password + Google OAuth
- **Role-based Access Control**: Admin and Sales User roles
- **Session Management**: JWT-based sessions with NextAuth.js
- **Logout Confirmation**: Professional confirmation dialog

### 📊 Dashboard & Analytics
- **Modern Dashboard**: Compact, professional design with collapsible sidebar
- **Real-time Stats**: Lead counts, conversion rates, deal metrics
- **Activity Timeline**: Recent activity feed with visual indicators
- **Responsive Design**: Mobile-first, enterprise-grade UI

### 👥 Lead Management
- **Complete CRUD**: Create, read, update, delete leads
- **Pipeline Stages**: New → Contacted → Qualified → Won/Lost
- **Advanced Filtering**: Search, stage, user, date range filters
- **Bulk Operations**: Export to CSV (Admin only)
- **Assignment System**: Assign leads to team members

### 🎨 Modern UI/UX
- **Collapsible Sidebar**: Expand/collapse with perfect alignment
- **Compact Design**: Professional spacing and typography
- **Premium Styling**: Gradients, shadows, smooth animations
- **Dark/Light Theme**: Consistent design system
- **Mobile Responsive**: Works perfectly on all devices

### 🔧 Technical Features
- **Type Safety**: Full TypeScript implementation
- **Form Validation**: Zod schemas with react-hook-form
- **Database**: MongoDB with Mongoose ODM
- **API Routes**: RESTful API with proper error handling
- **Real-time Updates**: Optimistic UI updates

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- Google OAuth credentials (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LeadFlow-CRM
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production-min-32-chars

   # Google OAuth (Optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/leadflow-crm
   # Or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/leadflow-crm
   ```

4. **Database Setup**
   
   **Option A: Local MongoDB**
   ```bash
   # Install MongoDB locally
   winget install MongoDB.Server  # Windows
   brew install mongodb/brew/mongodb-community  # macOS
   
   # Start MongoDB service
   mongod
   ```
   
   **Option B: MongoDB Atlas**
   - Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create cluster and get connection string
   - Update `MONGODB_URI` in `.env`

5. **Seed Database** (Optional)
   ```bash
   npm run seed
   ```
   This creates demo users and realistic lead data.

6. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

## 🔑 Demo Accounts

After running the seed script, you can use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@leadflow.com | admin123 |
| Admin | manager@leadflow.com | manager123 |
| Sales User | sales1@leadflow.com | sales123 |
| Sales User | sales2@leadflow.com | sales123 |

## 📁 Project Structure

```
LeadFlow-CRM/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── api/               # API routes
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── dashboard/         # Dashboard-specific components
│   │   ├── leads/             # Lead management components
│   │   ├── layout/            # Layout components (Sidebar, Header)
│   │   ├── providers/         # Context providers
│   │   └── ui/                # Reusable UI components (shadcn/ui)
│   ├── lib/                   # Utility libraries
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── db.ts             # Database connection
│   │   └── utils.ts          # Helper functions
│   ├── models/               # MongoDB/Mongoose models
│   └── types/                # TypeScript type definitions
├── scripts/                  # Utility scripts
│   └── seed-data.ts         # Database seeding script
├── public/                   # Static assets
└── .kiro/                   # Kiro AI specifications
    └── specs/leadflow-crm/  # Project specifications
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS 4**: Utility-first CSS framework
- **shadcn/ui**: Modern component library
- **Framer Motion**: Smooth animations
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **NextAuth.js**: Authentication library
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling

### Development
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking

## 🎨 UI Design System

### Color Palette
- **Primary**: Blue to Indigo gradients
- **Secondary**: Purple to Pink gradients
- **Success**: Green to Emerald gradients
- **Warning**: Orange to Amber gradients
- **Error**: Red to Rose gradients

### Typography
- **Headings**: Geist Sans (modern, clean)
- **Body**: System fonts with fallbacks
- **Code**: Geist Mono

### Components
- **Compact Design**: Professional spacing and sizing
- **Consistent Shadows**: Subtle depth and elevation
- **Smooth Animations**: 200-300ms transitions
- **Responsive**: Mobile-first approach

## 📊 Database Schema

### Users Collection
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  password?: string,        // For email/password auth
  image?: string,          // For OAuth providers
  role: 'admin' | 'user',
  createdAt: Date
}
```

### Leads Collection
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  phone?: string,
  company?: string,
  stage: 'New' | 'Contacted' | 'Qualified' | 'Won' | 'Lost',
  assignedTo?: ObjectId,   // Reference to Users
  followUpDate?: Date,
  notes: [{
    _id: ObjectId,
    content: string,
    authorId: ObjectId,
    authorName: string,
    createdAt: Date
  }],
  timeline: [{
    action: string,
    userId: ObjectId,
    userName: string,
    details?: string,
    timestamp: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Notifications Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  type: 'follow_up' | 'assignment',
  message: string,
  leadId: ObjectId,
  read: boolean,
  createdAt: Date
}
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signout` - Sign out user
- `GET /api/auth/session` - Get current session

### Leads
- `GET /api/leads` - List leads (with filtering)
- `POST /api/leads` - Create new lead
- `GET /api/leads/[id]` - Get lead by ID
- `PATCH /api/leads/[id]` - Update lead
- `DELETE /api/leads/[id]` - Delete lead

### Users
- `GET /api/users` - List users (Admin only)

### Export
- `GET /api/export` - Export leads to CSV (Admin only)

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/[id]` - Mark notification as read

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables for Production
```env
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/leadflow-crm
```

## 🧪 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run seed         # Seed database with demo data
```

### Code Quality
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for Next.js and TypeScript
- **Prettier**: Consistent code formatting
- **Git Hooks**: Pre-commit linting (optional)

## 🔒 Security Features

- **Authentication**: Secure JWT sessions
- **Authorization**: Role-based access control
- **Input Validation**: Zod schema validation
- **SQL Injection**: MongoDB prevents SQL injection
- **XSS Protection**: React's built-in XSS protection
- **CSRF Protection**: NextAuth.js CSRF tokens

## 🎯 Key Features Implemented

### Authentication System
- ✅ Email/password authentication with bcrypt hashing
- ✅ Google OAuth integration
- ✅ Role-based access control (Admin/User)
- ✅ Session management with NextAuth.js
- ✅ Logout confirmation dialog

### Dashboard & UI
- ✅ Modern, compact dashboard design
- ✅ Collapsible sidebar with perfect alignment
- ✅ Real-time statistics and metrics
- ✅ Activity timeline with visual indicators
- ✅ Responsive, mobile-first design

### Lead Management
- ✅ Complete CRUD operations for leads
- ✅ Pipeline stage management
- ✅ Lead assignment to team members
- ✅ Notes and activity tracking
- ✅ Advanced filtering and search

### Data Management
- ✅ MongoDB integration with Mongoose
- ✅ Database seeding with realistic demo data
- ✅ CSV export functionality (Admin only)
- ✅ Proper error handling and validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Vercel** - For seamless deployment platform
- **shadcn/ui** - For beautiful, accessible components
- **MongoDB** - For flexible, scalable database
- **Tailwind CSS** - For utility-first styling

---

**Built with ❤️ using Next.js, TypeScript, and MongoDB**