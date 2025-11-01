import {
  Link,
  Routes,
  Route,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Plus, User, LogOut, Home } from "lucide-react";
import { api, setAuthToken } from "./api";
import { ThemeProvider } from "./contexts/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";
import AnimatedButton from "./components/AnimatedButton";
import BlurText from "./components/BlurText";
import ClickSpark from "./components/ClickSpark";
import Landing from "./pages/Landing.jsx";
import Events from "./pages/Events.jsx";
import EventDetails from "./pages/EventDetails.jsx";
import ClubAuth from "./pages/ClubAuth.jsx";
import CreateEvent from "./pages/CreateEvent.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";

// Require JWT token for protected routes
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/club" replace />;
}

function Nav() {
  const nav = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAuthed = !!localStorage.getItem("token");
  const isClub = user?.role === "club";
  const isStudent = user?.role === "student";

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setAuthToken(null);
    nav("/");
  };

  const navItems = [
    { path: "/events", label: "Events", icon: Calendar, show: true },
    { path: "/create-event", label: "Create Event", icon: Plus, show: isClub },
    { path: "/dashboard", label: "Dashboard", icon: User, show: isStudent },
  ];

  return (
    <motion.nav
      className="sticky top-0 z-50 glass border-b border-opacity-20"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Home className="w-4 h-4 text-white" />
              </motion.div>
              <BlurText
                text="CampusConnect"
                className="text-xl font-bold gradient-text"
                animateBy="characters"
                stagger={0.03}
              />
            </Link>
          </motion.div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(
              (item) =>
                item.show && (
                  <motion.div
                    key={item.path}
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                  >
                    <Link
                      to={item.path}
                      className={`
                      flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                      ${
                        location.pathname === item.path
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }
                    `}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </motion.div>
                )
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {isAuthed ? (
              <div className="flex items-center space-x-3">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="hidden sm:block text-sm"
                >
                  <span className="text-gray-600 dark:text-gray-400">Hi, </span>
                  <span className="font-semibold">{user?.name || "User"}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-500 ml-1">
                    ({user?.role})
                  </span>
                </motion.div>

                <AnimatedButton
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </AnimatedButton>
              </div>
            ) : (
              <AnimatedButton
                onClick={() => nav("/club")}
                size="sm"
                className="flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </AnimatedButton>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

// Page transition wrapper
function PageTransition({ children }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  // Apply Authorization header from stored JWT (if present)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setAuthToken(token);
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen transition-colors duration-300">
        <ClickSpark />
        <Nav />
        <PageTransition>
          <div className="max-w-full mx-auto">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route
                path="/events"
                element={
                  <div className="p-4 max-w-6xl mx-auto">
                    <Events />
                  </div>
                }
              />
              <Route
                path="/events/:id"
                element={
                  <div className="p-4 max-w-6xl mx-auto">
                    <EventDetails />
                  </div>
                }
              />
              <Route
                path="/club"
                element={
                  <div className="p-4 max-w-6xl mx-auto">
                    <ClubAuth />
                  </div>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <div className="p-4 max-w-6xl mx-auto">
                    <StudentDashboard />
                  </div>
                }
              />
              {/* Protect create-event with JWT */}
              <Route
                path="/create-event"
                element={
                  <ProtectedRoute>
                    <div className="p-4 max-w-6xl mx-auto">
                      <CreateEvent />
                    </div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </PageTransition>
      </div>
    </ThemeProvider>
  );
}
