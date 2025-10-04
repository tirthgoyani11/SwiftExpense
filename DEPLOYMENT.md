# SwiftExpense - Vercel Deployment Guide

## Prerequisites
- Vercel CLI installed: `npm i -g vercel`
- Vercel account connected
- GitHub repository (optional but recommended)

## Environment Variables Setup

### Frontend Environment Variables
Set these in your Vercel dashboard under Settings > Environment Variables:

```
VITE_API_URL=https://your-app-name.vercel.app/api
VITE_APP_ENV=production
```

### Backend Environment Variables
Set these in your Vercel dashboard:

```
NODE_ENV=production
DATABASE_URL=file:./dev.db
JWT_SECRET=your-super-secure-jwt-secret-key-here
PORT=5000
FRONTEND_URL=https://your-app-name.vercel.app
```

## Deployment Steps

### Option 1: Using Vercel CLI
1. Navigate to project root:
   ```bash
   cd C:\Users\tirth\OneDrive\Desktop\oddo\SwiftExpense
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

### Option 2: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Set framework preset to "Other"
5. Configure environment variables as listed above
6. Deploy

## Project Structure
```
SwiftExpense/
├── vercel.json          # Vercel configuration
├── package.json         # Root package.json for deployment
├── frontend/           # React + Vite frontend
│   ├── dist/          # Built frontend (created during build)
│   └── package.json   # Frontend dependencies
└── backend/           # Express.js API
    ├── src/           # TypeScript source
    └── package.json   # Backend dependencies
```

## Important Notes

1. **Database**: Currently using SQLite (dev.db). For production, consider PostgreSQL
2. **File Uploads**: Current setup stores files locally. Consider cloud storage for production
3. **Environment Variables**: Update FRONTEND_URL after deployment to match your Vercel domain
4. **CORS**: Already configured to use FRONTEND_URL environment variable

## Post-Deployment
1. Update environment variables with actual Vercel URL
2. Test authentication flow
3. Verify API endpoints
4. Check WebSocket connections

## Troubleshooting
- If build fails, check Node.js version compatibility
- Ensure all environment variables are set correctly
- Check Vercel function logs for backend errors
- Verify CORS settings if frontend can't reach API