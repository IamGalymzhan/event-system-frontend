import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import NotFound from "./pages/NotFound";
import UserManagement from "./pages/UserManagement";
import FacultyManagement from "./pages/FacultyManagement";
import AttendanceQR from "./pages/AttendanceQR";
import MarkAttendance from "./pages/MarkAttendance";

// Protected route component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Role-based access control
  if (
    requiredRole &&
    user?.user?.role !== requiredRole &&
    user?.user?.role !== "ADMIN"
  ) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* All other routes (including dashboard) under MainLayout */}
          <Route element={<MainLayout />}>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/events/:id/edit" element={<EventEditRedirect />} />

            {/* Attendance Routes */}
            <Route
              path="/events/:id/attendance"
              element={
                <ProtectedRoute>
                  <AttendanceQR />
                </ProtectedRoute>
              }
            />
            <Route path="/mark-attendance/:id" element={<MarkAttendance />} />

            {/* Protected dashboard routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/events/create"
              element={
                <ProtectedRoute>
                  <CreateEvent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/events/:id/edit"
              element={
                <ProtectedRoute>
                  <EditEvent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/users"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/faculties"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <FacultyManagement />
                </ProtectedRoute>
              }
            />

            {/* Not found route */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

// Component to handle redirect from /events/:id/edit to /dashboard/events/:id/edit
const EventEditRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/dashboard/events/${id}/edit`} replace />;
};

export default App;
