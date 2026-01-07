# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Firebase Setup**
   
   a. Go to [Firebase Console](https://console.firebase.google.com/)
   
   b. Create a new project or select an existing one
   
   c. Enable Authentication:
      - Go to Authentication > Sign-in method
      - Enable "Email/Password"
      - Enable "Google" (add your OAuth consent screen if needed)
   
   d. Create Firestore Database:
      - Go to Firestore Database
      - Click "Create database"
      - Start in test mode (you'll add security rules later)
      - Choose a location
   
   e. Get your Firebase config:
      - Go to Project Settings (gear icon)
      - Scroll to "Your apps"
      - Click the web icon (`</>`)
      - Copy the config values

3. **Environment Variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=your-app-id
   ```

4. **Firestore Security Rules**
   
   Go to Firestore > Rules and paste:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       match /goals/{goalId} {
         allow read, write: if request.auth != null && 
           resource.data.userId == request.auth.uid;
         allow create: if request.auth != null && 
           request.resource.data.userId == request.auth.uid;
       }
       
       match /weeklyTasks/{taskId} {
         allow read, write: if request.auth != null && 
           get(/databases/$(database)/documents/goals/$(resource.data.goalId)).data.userId == request.auth.uid;
       }
       
       match /monthlyReflections/{reflectionId} {
         allow read, write: if request.auth != null && 
           get(/databases/$(database)/documents/goals/$(resource.data.goalId)).data.userId == request.auth.uid;
       }
     }
   }
   ```

5. **Run the App**
   ```bash
   npm run dev
   ```

6. **Open in Browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## Troubleshooting

### Firebase Connection Issues
- Verify all environment variables are set correctly
- Check that Firestore is enabled in your Firebase project
- Ensure Authentication is enabled with Email/Password and Google

### Build Errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Check Node.js version (requires 18+)

### Authentication Not Working
- Verify Firebase Authentication is enabled
- Check that Email/Password and Google providers are enabled
- Review browser console for error messages

## Production Build

```bash
npm run build
```

The built files will be in the `dist` directory, ready to deploy to:
- Firebase Hosting
- Vercel
- Netlify
- Any static hosting service

