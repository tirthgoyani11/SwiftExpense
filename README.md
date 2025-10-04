# 🚀 SwiftExpense - Smart Expense Management System

> Fast-track your expenses with AI-powered automation and smooth UX

## 📋 Project Overview

SwiftExpense is a revolutionary expense management system built for the Odoo hackathon challenge. It combines cutting-edge technology with intuitive user experience to solve real enterprise problems.

Based on our comprehensive [Expense Flow Analysis](EXPENSE_FLOW_ANALYSIS.md), this system implements a complete corporate expense management workflow with multi-role authentication, dynamic approval workflows, and AI-powered receipt processing.

### ✨ Key Features

#### 🏢 **Multi-Role Corporate System**
- **Admin**: Company setup, user management, approval rule configuration
- **Manager**: Approval dashboard with currency conversion, team oversight
- **Employee**: Expense submission, receipt upload, status tracking

#### 📸 **Smart OCR Processing** 
- Extract data from receipts instantly with Tesseract.js
- Auto-populate expense forms (amount, date, merchant, category)
- Support for photo capture and file upload

#### ⚡ **Dynamic Approval Workflows**
- Percentage-based approval requirements
- Sequential vs parallel approval processing
- Manager hierarchy respect
- Auto-approval rules for amounts below thresholds

#### 🌍 **Multi-Currency Support**
- Submit expenses in any world currency
- Real-time conversion to company base currency
- Historical rate locking at submission time
- Live exchange rate integration

#### 📱 **Mobile-First PWA**
- Responsive design across all devices
- Offline capabilities for expense creation
- Touch-optimized approval workflows
- Progressive Web App features

#### 📊 **Real-Time Analytics**
- Live expense tracking and notifications
- Approval metrics and processing times
- Category-based spending analysis
- Team and company-wide statistics

#### 🔄 **Live Collaboration**
- Socket.io powered real-time updates
- Instant approval notifications
- Live status changes
- Multi-user activity tracking

## 🏗️ Architecture

### Frontend Stack
- **React 18** + **Vite** + **TypeScript**
- **Tailwind CSS** for styling
- **Framer Motion** + **Lenis** for smooth animations
- **Zustand** for state management
- **React Query** for server state
- **Socket.io Client** for real-time features

### Backend Stack
- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** with **Prisma ORM**
- **JWT** authentication
- **Socket.io** for real-time communication
- **Multer** for file uploads

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ (or use alternatives below)
- PostgreSQL 14+
- Git

### Alternative Package Managers (If NPM Issues)

#### Option 1: Using Yarn
```bash
# Install Yarn: https://classic.yarnpkg.com/en/docs/install
yarn --version
```

#### Option 2: Using PNPM
```bash
# Install PNPM
iwr https://get.pnpm.io/install.ps1 -useb | iex
pnpm --version
```

#### Option 3: Using Bun (Fastest)
```bash
# Install Bun: https://bun.sh/
bun --version
```

### 📁 Project Structure

```
SwiftExpense/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── ui/          # Basic UI components
│   │   │   ├── forms/       # Form components
│   │   │   └── layout/      # Layout components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── store/           # Zustand stores
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   └── assets/          # Static assets
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── backend/                  # Node.js backend
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   └── config/          # Configuration
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # Database migrations
│   ├── package.json
│   └── tsconfig.json
└── ODOO_EXPENSE_HACKATHON_MASTERPLAN.md
```

### 🔧 Installation & Setup

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd SwiftExpense
```

#### 2. Backend Setup
```bash
cd backend

# Install dependencies (choose one)
npm install          # Option 1: NPM
yarn install         # Option 2: Yarn
pnpm install         # Option 3: PNPM
bun install          # Option 4: Bun

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials and secrets

# Setup database
npm run prisma:migrate    # Run migrations
npm run seed              # Seed with sample data

# Start backend server
npm run dev
```

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies (choose one)
npm install          # Option 1: NPM
yarn install         # Option 2: Yarn
pnpm install         # Option 3: PNPM
bun install          # Option 4: Bun

# Start frontend server
npm run dev          # Or yarn dev, pnpm dev, bun dev
```

#### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### 🔐 Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/swift_expense"

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# CORS
CORS_ORIGIN=http://localhost:3000

# Server
PORT=5000
NODE_ENV=development
```

### 📊 Database Schema

The application uses PostgreSQL with Prisma ORM. Key entities:

- **Companies** - Multi-tenant support
- **Users** - Role-based access (Admin, Manager, Employee)
- **Expenses** - Core expense records with OCR data
- **Approval Workflows** - Configurable approval rules
- **Approval Steps** - Individual approval actions
- **Notifications** - Real-time user notifications
- **Activity Logs** - Audit trail

### 🎯 Development Workflow

#### Frontend Development
```bash
cd frontend
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build
```

#### Backend Development
```bash
cd backend
npm run dev          # Start dev server with nodemon
npm run build        # Compile TypeScript
npm run start        # Start production server
```

#### Database Operations
```bash
cd backend
npm run prisma:studio      # Open Prisma Studio
npm run prisma:migrate     # Create and run migrations
npm run prisma:generate    # Generate Prisma client
```

### 🚀 Deployment

#### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel --prod
```

#### Backend (Railway/Render)
```bash
cd backend
# Connect to Railway or Render
railway login
railway init
railway add postgresql
railway deploy
```

### 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### 📱 Features Implementation Status

#### ✅ **Completed (Hours 1-2)**
- ✅ Complete project structure setup
- ✅ Frontend/Backend TypeScript configuration
- ✅ Database schema design and validation
- ✅ UI components and layouts foundation
- ✅ Authentication store and service setup
- ✅ **Complete system flow analysis and documentation**

#### 🔄 **In Progress (Hour 3)**
- 🔄 Corporate authentication system implementation
- 🔄 Database connection and migrations
- 🔄 Environment configuration

#### ⏳ **Next Up (Hours 3-8)**
- ⏳ **Hour 3-4**: Core Backend (Auth, CRUD, Database)
- ⏳ **Hour 5-6**: Expense Management (Forms, File Upload, OCR)
- ⏳ **Hour 7**: Advanced Features (Real-time, Approvals, Analytics)
- ⏳ **Hour 8**: Polish & Deploy (PWA, Mobile, Production)

### 📋 **System Documentation**

For complete system understanding, see our detailed documentation:

- **[EXPENSE_FLOW_ANALYSIS.md](EXPENSE_FLOW_ANALYSIS.md)** - Complete system flow and architecture
- **[PROJECT_PROGRESS.md](PROJECT_PROGRESS.md)** - Development progress and timeline
- **[ODOO_EXPENSE_HACKATHON_MASTERPLAN.md](ODOO_EXPENSE_HACKATHON_MASTERPLAN.md)** - Technical strategy

### 🛠️ Troubleshooting

#### NPM Issues
If NPM doesn't work, use these alternatives:

1. **Use Yarn**: `yarn install && yarn dev`
2. **Use PNPM**: `pnpm install && pnpm dev`
3. **Use Bun**: `bun install && bun dev`
4. **Use CDN**: See masterplan for CDN-only setup

#### Database Connection Issues
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in .env
3. Run `npm run prisma:generate`

#### Port Conflicts
- Backend runs on port 5000
- Frontend runs on port 3000
- Change ports in package.json scripts if needed

### 📚 Learning Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Socket.io Documentation](https://socket.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

### 📄 License

MIT License - see LICENSE file for details

### 🎉 Hackathon Success Metrics

- **Technical Excellence**: Full-stack TypeScript ✅
- **Innovation**: AI-powered OCR + Real-time features ⏳
- **User Experience**: Smooth animations + Mobile-first ⏳
- **Business Value**: Solves real enterprise problems ✅

---

**Built with ❤️ for the Odoo Hackathon Challenge**

🚀 **Ready to revolutionize expense management!**