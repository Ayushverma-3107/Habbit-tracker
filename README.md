# 🔥 Goal Planner App 

A modern, dark-themed goal planning and tracking application built with React, TypeScript, and Firebase. Help users set, track, and review goals throughout the year with a clean, minimal interface.

## ✨ Features

### Core Features
- **User Authentication**
  - Email/password sign up and login
  - Google OAuth integration
  - Secure user sessions

- **Dashboard**
  - Yearly overview of all goals
  - Progress bars with completion percentages
  - Motivational quotes section
  - Quick stats (Total, Active, Completed goals)

- **Goal Management**
  - Create goals with title, category, dates, and priority
  - Edit and delete goals
  - Categorize goals (Health, Study, Career, Finance, Personal, Other)
  - Set priorities (Low, Medium, High)

- **Monthly & Weekly Planning**
  - Monthly goal breakdown
  - Weekly task checklist for each goal
  - Checkbox-based completion system
  - Week-by-week progress tracking

- **Progress Tracking**
  - Auto-calculated completion percentage
  - Visual charts (bar charts, pie charts)
  - Category and priority distribution
  - Overall progress metrics

- **Reflection & Review Section**
  - Monthly reflection notes
  - "What went well" / "What didn't go well"
  - Lessons learned
  - Historical reflection review

- **Dark Mode UI**
  - Black/dark gray background
  - Accent colors (purple, green, blue)
  - Minimal, distraction-free design
  - Responsive layout

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Backend**: Firebase (Firestore, Authentication)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Utilities**: date-fns

### Project Structure
```
app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.tsx       # Main layout with navigation
│   │   ├── WeeklyPlanning.tsx
│   │   └── MonthlyReflection.tsx
│   ├── context/             # React context providers
│   │   └── AuthContext.tsx  # Authentication context
│   ├── firebase/            # Firebase configuration
│   │   └── config.ts
│   ├── pages/               # Page components
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Goals.tsx
│   │   ├── CreateGoal.tsx
│   │   ├── GoalDetail.tsx
│   │   ├── Progress.tsx
│   │   └── Reflections.tsx
│   ├── services/            # Business logic services
│   │   └── goalService.ts   # Goal CRUD operations
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx              # Main app component with routing
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## 🗄️ Database Schema

### Firestore Collections

#### `users`
```typescript
{
  id: string (document ID)
  email: string
  displayName?: string
  photoURL?: string
  createdAt: string (ISO date)
}
```

#### `goals`
```typescript
{
  id: string (document ID)
  userId: string
  title: string
  category: 'Health' | 'Study' | 'Career' | 'Finance' | 'Personal' | 'Other'
  startDate: string (ISO date)
  endDate: string (ISO date)
  priority: 'Low' | 'Medium' | 'High'
  description?: string
  completed: boolean
  completionPercentage: number (0-100)
  createdAt: string (ISO date)
  updatedAt: string (ISO date)
}
```

#### `weeklyTasks`
```typescript
{
  id: string (document ID)
  goalId: string
  weekStartDate: string (ISO date, start of week)
  tasks: Array<{
    id: string
    title: string
    completed: boolean
    completedAt?: string (ISO date)
  }>
  completed: boolean
}
```

#### `monthlyReflections`
```typescript
{
  id: string (document ID)
  goalId: string
  month: string (format: 'YYYY-MM')
  whatWentWell: string
  whatDidntGoWell: string
  lessonsLearned: string
  createdAt: string (ISO date)
}
```

### Firestore Security Rules (Recommended)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Goals: users can only access their own goals
    match /goals/{goalId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Weekly tasks: users can only access tasks for their goals
    match /weeklyTasks/{taskId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/goals/$(resource.data.goalId)).data.userId == request.auth.uid;
    }
    
    // Monthly reflections: users can only access reflections for their goals
    match /monthlyReflections/{reflectionId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/goals/$(resource.data.goalId)).data.userId == request.auth.uid;
    }
  }
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Firebase project with Firestore and Authentication enabled

### Installation

1. **Clone the repository**
   ```bash
   cd app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password and Google)
   - Create a Firestore database
   - Get your Firebase configuration

4. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=your-app-id
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## 🎨 UI Components

### Color Scheme
- **Background**: `#0a0a0a` (dark-bg)
- **Surface**: `#1a1a1a` (dark-surface)
- **Card**: `#1f1f1a` (dark-card)
- **Border**: `#2a2a2a` (dark-border)
- **Text**: `#e0e0e0` (dark-text)
- **Accent Purple**: `#9333ea`
- **Accent Green**: `#10b981`
- **Accent Blue**: `#3b82f6`

### Key Components
- **Layout**: Main navigation bar with routing
- **Dashboard**: Overview with stats and recent goals
- **Goals List**: Filterable grid of goals
- **Goal Detail**: Full goal view with tabs (Overview, Weekly, Reflection)
- **Progress**: Charts and analytics
- **Reflections**: Historical reflection review

## 📱 Routes

- `/login` - Login page
- `/signup` - Sign up page
- `/dashboard` - Main dashboard (protected)
- `/goals` - Goals list (protected)
- `/goals/new` - Create new goal (protected)
- `/goals/:id` - Goal detail page (protected)
- `/progress` - Progress charts (protected)
- `/reflections` - Reflections list (protected)

## 🔒 Authentication Flow

1. User signs up/logs in (email/password or Google)
2. Firebase creates/authenticates user
3. User document created/updated in Firestore
4. Auth context provides user state throughout app
5. Protected routes check authentication
6. User data scoped by `userId` in Firestore queries

## 📊 Progress Calculation

- Completion percentage is calculated based on completed weekly tasks
- Formula: `(completed tasks / total tasks) * 100`
- Automatically updated when tasks are marked complete/incomplete

## 🎯 Future Enhancements

- [ ] Daily reminders/notifications
- [ ] Export goals as PDF/CSV
- [ ] Habit tracking integration
- [ ] Offline mode with sync
- [ ] Goal templates
- [ ] Social sharing
- [ ] Mobile app (React Native)

## 📝 License

MIT License - feel free to use this project for your own goals!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using React, TypeScript, and Firebase

