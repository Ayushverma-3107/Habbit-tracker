# App Architecture & Wireframe Description

## 🏗️ Application Architecture

### Component Hierarchy

```
App
├── AuthProvider (Context)
│   └── Router
│       ├── Public Routes
│       │   ├── Login
│       │   └── Signup
│       └── Private Routes
│           └── Layout
│               ├── Navigation Bar
│               └── Page Content
│                   ├── Dashboard
│                   ├── Goals (List)
│                   ├── CreateGoal
│                   ├── GoalDetail
│                   │   ├── Overview Tab
│                   │   ├── WeeklyPlanning
│                   │   └── MonthlyReflection
│                   ├── Progress
│                   └── Reflections
```

### Data Flow

1. **Authentication Flow**
   - User logs in → Firebase Auth → AuthContext updates → Protected routes accessible
   - User data stored in Firestore `users` collection

2. **Goal Management Flow**
   - Create Goal → Firestore `goals` collection → Dashboard/Goals list updates
   - Edit/Delete → Firestore update → UI re-renders
   - Progress calculated from `weeklyTasks` collection

3. **Weekly Planning Flow**
   - Select week → Load/create `weeklyTasks` → Add/complete tasks → Update progress
   - Task completion → Recalculate goal completion percentage

4. **Reflection Flow**
   - Select month → Load/create `monthlyReflections` → Save reflection → View in Reflections page

## 🎨 UI Wireframe Description

### 1. Login/Signup Pages
```
┌─────────────────────────────────────┐
│         [Target Icon]               │
│      Welcome Back / Create          │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  Email: [____________]        │  │
│  │  Password: [_________]        │  │
│  │  [Sign In / Sign Up Button]   │  │
│  │                               │  │
│  │  ───── Or continue with ───── │  │
│  │  [Sign in with Google]        │  │
│  │                               │  │
│  │  Don't have account? Sign up │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### 2. Dashboard
```
┌─────────────────────────────────────────────────────┐
│ [Goal Planner]  [Dashboard] [Goals] [Progress] ... │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Dashboard                    [+ New Goal]         │
│  Welcome back! Here's your progress overview.       │
│                                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│  │Total │ │Active│ │Done  │ │Avg % │              │
│  │  12  │ │  8   │ │  4   │ │  65% │              │
│  └──────┘ └──────┘ └──────┘ └──────┘              │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ "Motivational quote here..."                │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Your Goals                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Goal 1   │ │ Goal 2   │ │ Goal 3   │           │
│  │ Category │ │ Category │ │ Category │           │
│  │ [Progress│ │ [Progress│ │ [Progress│           │
│  │  Bar]    │ │  Bar]    │ │  Bar]    │           │
│  │ Due: ... │ │ Due: ... │ │ Due: ... │           │
│  └──────────┘ └──────────┘ └──────────┘           │
└─────────────────────────────────────────────────────┘
```

### 3. Goals List
```
┌─────────────────────────────────────────────────────┐
│ [Goal Planner]  [Dashboard] [Goals] [Progress] ... │
├─────────────────────────────────────────────────────┤
│                                                     │
│  My Goals                          [+ New Goal]     │
│  Manage and track all your goals                   │
│                                                     │
│  [All] [Active] [Completed]  [Category: All ▼]     │
│                                                     │
│  ┌──────────────┐ ┌──────────────┐                │
│  │ Goal Title   │ │ Goal Title   │                │
│  │ [Category]   │ │ [Category]   │                │
│  │ [Priority]   │ │ [Priority]   │                │
│  │ [Progress]   │ │ [Progress]   │                │
│  │ Start: ...   │ │ Start: ...   │                │
│  │ Due: ...     │ │ Due: ...     │                │
│  └──────────────┘ └──────────────┘                │
└─────────────────────────────────────────────────────┘
```

### 4. Goal Detail
```
┌─────────────────────────────────────────────────────┐
│ [Goal Planner]  [Dashboard] [Goals] [Progress] ... │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ← Back to Goals                                    │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Goal Title                    [✓] [Edit]     │   │
│  │ [Category] [Priority]                       │   │
│  │ Description text...                         │   │
│  │                                             │   │
│  │ Progress: 65%                               │   │
│  │ [████████████░░░░░░░░]                      │   │
│  │                                             │   │
│  │ 📅 Start: Jan 1, 2024                      │   │
│  │ 📅 Due: Dec 31, 2024                        │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  [Overview] [Weekly] [Reflection]                   │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ [Tab Content Area]                          │   │
│  │                                             │   │
│  │ - Overview: Stats and info                 │   │
│  │ - Weekly: Task checklist                   │   │
│  │ - Reflection: Monthly notes                 │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 5. Progress Page
```
┌─────────────────────────────────────────────────────┐
│ [Goal Planner]  [Dashboard] [Goals] [Progress] ... │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Progress Overview                                  │
│  Track your progress across all goals               │
│                                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐                       │
│  │Overall│ │Active│ │Done  │                       │
│  │  65%  │ │  8   │ │  4   │                       │
│  └──────┘ └──────┘ └──────┘                       │
│                                                     │
│  ┌──────────────────┐ ┌──────────────────┐         │
│  │ Goal Progress    │ │ Goals by        │         │
│  │ [Bar Chart]      │ │ Category        │         │
│  │                  │ │ [Pie Chart]     │         │
│  └──────────────────┘ └──────────────────┘         │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Goals by Priority                           │   │
│  │ [Bar Chart]                                 │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 6. Reflections Page
```
┌─────────────────────────────────────────────────────┐
│ [Goal Planner]  [Dashboard] [Goals] [Progress] ... │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Reflections                                        │
│  Review your monthly reflections and learnings      │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Goal Title                    [Category]   │   │
│  │ 📅 January 2024                            │   │
│  │                                             │   │
│  │ ✨ What Went Well                          │   │
│  │ Reflection text here...                    │   │
│  │                                             │   │
│  │ 🤔 What Didn't Go Well                     │   │
│  │ Reflection text here...                    │   │
│  │                                             │   │
│  │ 📚 Lessons Learned                         │   │
│  │ Reflection text here...                    │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## 🎨 Design System

### Color Palette
- **Background**: `#0a0a0a` - Deep black for main background
- **Surface**: `#1a1a1a` - Slightly lighter for cards/surfaces
- **Card**: `#1f1f1f` - Card backgrounds
- **Border**: `#2a2a2a` - Subtle borders
- **Text Primary**: `#e0e0e0` - Main text
- **Text Secondary**: `#a0a0a0` - Secondary text
- **Accent Purple**: `#9333ea` - Primary actions, progress bars
- **Accent Green**: `#10b981` - Success, completed states
- **Accent Blue**: `#3b82f6` - Information, charts

### Typography
- **Headings**: Bold, 24-32px
- **Body**: Regular, 14-16px
- **Small**: Regular, 12-14px
- **Font Family**: System fonts (San Francisco, Segoe UI, etc.)

### Spacing
- **Small**: 4px, 8px
- **Medium**: 16px, 24px
- **Large**: 32px, 48px

### Components

#### Buttons
- **Primary**: Purple background, white text, rounded corners
- **Secondary**: Dark card background, border, text
- **Icon**: Icon-only, hover states

#### Cards
- Dark surface background
- Border with hover effects
- Padding: 24px
- Border radius: 8px

#### Inputs
- Dark card background
- Border on focus (purple ring)
- Placeholder text in secondary color

#### Progress Bars
- Background: Dark card
- Fill: Accent purple
- Height: 8-12px
- Rounded corners

## 🔄 State Management

### Context API
- **AuthContext**: User authentication state, login/logout functions

### Local State
- Component-level state with `useState` for:
  - Form inputs
  - Loading states
  - UI toggles (tabs, modals)

### Data Fetching
- Direct Firestore queries in components
- Service layer (`goalService`) for business logic
- Real-time updates via Firestore listeners (can be added)

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px (single column, stacked)
- **Tablet**: 640px - 1024px (2 columns)
- **Desktop**: > 1024px (3 columns, full layout)

### Mobile Considerations
- Hamburger menu for navigation (can be added)
- Touch-friendly button sizes (44px minimum)
- Swipeable tabs
- Bottom navigation bar (optional)

## 🔐 Security Considerations

1. **Authentication**: Firebase Auth handles all auth logic
2. **Authorization**: Firestore security rules enforce data access
3. **Data Validation**: Client-side validation + Firestore rules
4. **Input Sanitization**: React automatically escapes XSS
5. **HTTPS**: Required for production (Firebase enforces)

## 🚀 Performance Optimizations

1. **Code Splitting**: React Router lazy loading (can be added)
2. **Image Optimization**: Lazy loading, WebP format
3. **Bundle Size**: Tree shaking, minimal dependencies
4. **Caching**: Firestore offline persistence (can be enabled)
5. **Memoization**: React.memo for expensive components (can be added)

