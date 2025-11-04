# XFactor Database & API Setup Guide

## Quick Start

### 1. Start the API Server

```bash
npm run server
```

Or use the startup script:
```bash
./start-server.sh
```

The server will start on `http://localhost:3001`

**Important**: The server must be running before accessing the frontend, otherwise you'll see CORS errors.

### 2. Start the Frontend

In a separate terminal:
```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### 3. Verify Everything is Working

- API Server: http://localhost:3001
- Frontend: http://localhost:5173
- Check server status: `lsof -ti:3001` (should return a process ID)

## Troubleshooting CORS Errors

If you see "CORS request did not succeed" errors:

1. **Check if server is running**: `lsof -ti:3001`
2. **Restart the server**: `npm run server`
3. **Clear browser cache** and refresh
4. **Check browser console** for detailed error messages

The CORS configuration allows:
- `http://localhost:5173` (frontend dev server)
- `http://localhost:3000` (alternative frontend port)
- `http://127.0.0.1:5173` and `http://127.0.0.1:3000`

---

# XFactor Database & API Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database
```bash
npm run db:init
```

### 3. Seed Test Users
```bash
npm run db:seed
```

Or reset everything:
```bash
npm run db:reset
```

### 4. Start Backend Server
```bash
npm run server
```

Server will run on `http://localhost:3001`

### 5. Start Frontend (in separate terminal)
```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`

## Test Users

After seeding, you can login with:

**Students:**
- `student1@test.com` / `password123`
- `student2@test.com` / `password123`
- `student3@test.com` / `password123`

**Parents:**
- `parent1@test.com` / `password123`
- `parent2@test.com` / `password123`

**Tutors:**
- `tutor1@test.com` / `password123`
- `tutor2@test.com` / `password123`

## Database Schema

The database includes:
- **users** - All user accounts with personas
- **events** - Analytics events
- **loop_executions** - Viral loop tracking
- **smart_links** - Attribution links
- **invites** - Invitation tracking
- **rewards** - Reward allocation
- **presence** - Real-time presence
- **leaderboard_entries** - Rankings
- **test_results** - Test/assessment results
- **activity_feed** - User activity

## API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Dashboard
- `GET /api/presence` - Get presence data
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/activity` - Get activity feed
- `GET /api/cohorts` - Get cohort rooms

### Test Results
- `GET /api/test-results` - Get user's test results
- `GET /api/test-results/latest` - Get latest result

### Viral Loops
- `POST /api/viral-loops/trigger` - Trigger a viral loop
- `POST /api/invites` - Create an invite

## Testing Features

1. **Login as Student 1** - See dashboard with presence, leaderboard, activity
2. **View Test Results** - See results page with viral sharing options
3. **Switch to Student 2** - Test different user perspectives
4. **Login as Parent** - See parent-specific features
5. **Login as Tutor** - See tutor-specific features

## Database File

The database file `xfactor.db` is created in the project root. To reset:
```bash
npm run db:reset
```

