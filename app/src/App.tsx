import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import GoalDetail from './pages/GoalDetail';
import CreateGoal from './pages/CreateGoal';
import Progress from './pages/Progress';
import Reflections from './pages/Reflections';
import Layout from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="text-dark-text-secondary">Loading...</div>
      </div>
    );
  }
  
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="text-dark-text-secondary">Loading...</div>
      </div>
    );
  }
  
  return !currentUser ? <>{children}</> : <Navigate to="/dashboard" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/goals"
        element={
          <PrivateRoute>
            <Layout>
              <Goals />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/goals/new"
        element={
          <PrivateRoute>
            <Layout>
              <CreateGoal />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/goals/:id"
        element={
          <PrivateRoute>
            <Layout>
              <GoalDetail />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <PrivateRoute>
            <Layout>
              <Progress />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/reflections"
        element={
          <PrivateRoute>
            <Layout>
              <Reflections />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;

