import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Users,
  Mail,
  Lock,
  UserPlus,
  LogIn,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { api, setAuthToken } from "../api";
import { useNavigate } from "react-router-dom";
import AnimatedCard from "../components/AnimatedCard";
import AnimatedButton from "../components/AnimatedButton";
import BlurText from "../components/BlurText";

export default function ClubAuth() {
  const nav = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("student"); // student or club
  const [clubName, setClubName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [rbtNumber, setRbtNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("error");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      let url, body, responseData;

      if (role === "club") {
        url = isLogin ? "/clubs/login" : "/clubs/register";
        body = isLogin ? { email, password } : { clubName, email, password };
      } else {
        url = isLogin ? "/students/login" : "/students/register";
        body = isLogin
          ? { email, password }
          : { name: studentName, rbtNumber, email, password };
      }

      const res = await api.post(url, body);
      responseData = res.data;

      console.log("[Auth] Response received:", responseData);
      console.log("[Auth] Token:", responseData.token ? "EXISTS" : "MISSING");
      console.log("[Auth] Role:", responseData.role);

      // Save user info and JWT based on role
      if (responseData.role === "club") {
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: responseData.clubId,
            name: responseData.clubName,
            email: responseData.email,
            role: "club",
          })
        );
      } else {
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: responseData.studentId,
            name: responseData.name,
            rbtNumber: responseData.rbtNumber,
            email: responseData.email,
            role: "student",
          })
        );
      }

      localStorage.setItem("token", responseData.token);
      setAuthToken(responseData.token);

      console.log("[Auth] Token saved to localStorage");
      console.log(
        "[Auth] Verification - Token in storage:",
        localStorage.getItem("token") ? "CONFIRMED" : "FAILED"
      );

      setMsg(
        `Welcome ${
          responseData.role === "club"
            ? responseData.clubName
            : responseData.name
        }!`
      );
      setMsgType("success");

      // Navigate based on role after a short delay
      setTimeout(() => {
        if (responseData.role === "club") {
          nav("/create-event");
        } else {
          nav("/events");
        }
      }, 1000);
    } catch (err) {
      setMsg(err.response?.data?.message || "Authentication failed");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setMsg("");
  };

  const toggleRole = (newRole) => {
    setRole(newRole);
    setMsg("");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md space-y-8 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <motion.div
            className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            {role === "club" ? (
              <Users className="w-10 h-10 text-white" />
            ) : (
              <User className="w-10 h-10 text-white" />
            )}
          </motion.div>

          <BlurText
            text={`${isLogin ? "Welcome Back" : "Join CampusConnect"}`}
            className="text-3xl font-bold gradient-text"
            animateBy="words"
            stagger={0.1}
          />

          <BlurText
            text={`${
              isLogin ? "Sign in to your account" : "Create your account"
            } as a ${role}`}
            className="text-gray-600 dark:text-gray-400"
            delay={0.3}
            animateBy="words"
          />
        </motion.div>

        {/* Auth Card */}
        <AnimatedCard className="glass" delay={0.4}>
          {/* Message Alert */}
          <AnimatePresence>
            {msg && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className={`
                  p-4 rounded-lg border flex items-center space-x-3 mb-6
                  ${
                    msgType === "success"
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                      : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                  }
                `}
              >
                {msgType === "success" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="font-medium">{msg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Role Selection */}
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6">
            {["student", "club"].map((roleOption) => (
              <motion.button
                key={roleOption}
                type="button"
                onClick={() => toggleRole(roleOption)}
                className={`
                  flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md font-medium transition-all duration-200
                  ${
                    role === roleOption
                      ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {roleOption === "club" ? (
                  <Users className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span className="capitalize">{roleOption}</span>
              </motion.button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-4 overflow-hidden"
                >
                  {role === "club" ? (
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                      <input
                        className="input pl-10"
                        placeholder="Club Name"
                        value={clubName}
                        onChange={(e) => setClubName(e.target.value)}
                        required
                      />
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
                        <input
                          className="input pl-10"
                          placeholder="Your Name"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
                        <input
                          className="input pl-10"
                          placeholder="RBT Number"
                          value={rbtNumber}
                          onChange={(e) => setRbtNumber(e.target.value)}
                          required
                        />
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
              <input
                type="email"
                className="input pl-10"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                className="input pl-10 pr-12"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Submit Button */}
            <AnimatedButton
              type="submit"
              loading={loading}
              className="w-full flex items-center justify-center space-x-2"
              size="lg"
            >
              {isLogin ? (
                <LogIn className="w-5 h-5" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
              <span>{isLogin ? "Sign In" : "Create Account"}</span>
            </AnimatedButton>
          </form>

          {/* Toggle Mode */}
          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>
            <motion.button
              type="button"
              onClick={toggleMode}
              className="ml-2 text-blue-600 dark:text-blue-400 font-medium hover:underline"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </motion.button>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
}
