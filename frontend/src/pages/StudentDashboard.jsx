import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Ticket,
  Calendar,
  Clock,
  Eye,
  X,
  AlertCircle,
  CheckCircle,
  Search,
  TrendingUp,
} from "lucide-react";
import { api } from "../api";
import AnimatedCard from "../components/AnimatedCard";
import AnimatedList from "../components/AnimatedList";
import AnimatedButton from "../components/AnimatedButton";
import BlurText from "../components/BlurText";
import CountUp from "../components/CountUp";

export default function StudentDashboard() {
  const nav = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [cancellingTicket, setCancellingTicket] = useState(null);

  const fetchTickets = () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const isStudent = user?.role === "student";

    if (!isStudent) {
      nav("/club");
      return;
    }

    // Fetch student's tickets
    api
      .get(`/tickets/my-tickets`)
      .then((res) => {
        setTickets(res.data);
        console.log("Student tickets loaded:", res.data);
      })
      .catch((err) => {
        console.error("Failed to load tickets:", err);
        setMsg("Failed to load your tickets");
        setMsgType("error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, [nav]);

  const handleCancelTicket = async (ticketId) => {
    if (!confirm("Are you sure you want to cancel this ticket?")) {
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "null");
    setCancellingTicket(ticketId);
    setMsg("");

    try {
      await api.delete(`/tickets/${ticketId}`);
      setMsg("Ticket cancelled successfully!");
      setMsgType("success");
      // Refresh tickets list
      fetchTickets();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to cancel ticket");
      setMsgType("error");
      setTimeout(() => setMsg(""), 5000);
    } finally {
      setCancellingTicket(null);
    }
  };

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isStudent = user?.role === "student";

  if (!isStudent) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <BlurText
            text="Loading your dashboard..."
            className="text-lg font-medium"
            animateBy="words"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <BlurText
          text="Student Dashboard"
          className="text-4xl md:text-5xl font-bold gradient-text"
          animateBy="words"
          stagger={0.1}
        />
        <BlurText
          text={`Welcome back, ${user.name}!`}
          className="text-lg text-gray-600 dark:text-gray-400"
          delay={0.3}
          animateBy="words"
        />
      </motion.div>

      {/* Message Alert */}
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`
              p-4 rounded-lg border flex items-center space-x-3
              ${
                msgType === "success"
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                  : msgType === "error"
                  ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                  : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
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

      {/* User Info Card */}
      <AnimatedCard className="glass" delay={0.2}>
        <div className="flex items-center space-x-4">
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            <User className="w-8 h-8 text-white" />
          </motion.div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Student ID: {user.rbtNumber}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {user.email}
            </p>
          </div>
          <div className="text-right">
            <CountUp
              end={tickets.length}
              className="text-3xl font-bold text-purple-600 dark:text-purple-400"
              duration={1.5}
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Registered Events
            </p>
          </div>
        </div>
      </AnimatedCard>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatedCard className="glass text-center" delay={0.3}>
          <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <CountUp
            end={tickets.length}
            className="text-2xl font-bold text-green-600 dark:text-green-400"
            duration={1.2}
          />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Active Registrations
          </p>
        </AnimatedCard>

        <AnimatedCard className="glass text-center" delay={0.4}>
          <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <CountUp
            end={
              tickets.filter(
                (t) =>
                  new Date(t.bookingTime) >
                  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length
            }
            className="text-2xl font-bold text-blue-600 dark:text-blue-400"
            duration={1.4}
          />
          <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
        </AnimatedCard>

        <AnimatedCard className="glass text-center" delay={0.5}>
          <Ticket className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <CountUp
            end={tickets.length}
            className="text-2xl font-bold text-purple-600 dark:text-purple-400"
            duration={1.6}
          />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Tickets
          </p>
        </AnimatedCard>
      </div>

      {/* Registered Events */}
      <AnimatedCard className="glass" delay={0.6}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center space-x-2">
            <Ticket className="w-6 h-6 text-purple-500" />
            <span>My Registered Events</span>
          </h3>
          <Link to="/events">
            <AnimatedButton
              variant="secondary"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>Browse Events</span>
            </AnimatedButton>
          </Link>
        </div>

        {tickets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <motion.div
              className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Ticket className="w-12 h-12 text-gray-400" />
            </motion.div>
            <BlurText
              text="No events registered yet"
              className="text-xl font-semibold text-gray-600 dark:text-gray-400"
            />
            <BlurText
              text="Discover amazing campus events and start your journey!"
              className="text-gray-500 dark:text-gray-500 mt-2"
              delay={0.2}
            />
            <Link to="/events" className="inline-block mt-6">
              <AnimatedButton className="flex items-center space-x-2">
                <Search className="w-4 h-4" />
                <span>Browse Events</span>
              </AnimatedButton>
            </Link>
          </motion.div>
        ) : (
          <AnimatedList className="space-y-4" stagger={0.1}>
            {tickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-2">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                      {ticket.eventName}
                    </h4>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Ticket className="w-4 h-4" />
                        <span>ID: {ticket.id}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          Booked:{" "}
                          {new Date(ticket.bookingTime).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/events/${ticket.eventId}`}>
                      <AnimatedButton
                        variant="secondary"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </AnimatedButton>
                    </Link>

                    <AnimatedButton
                      variant="danger"
                      size="sm"
                      loading={cancellingTicket === ticket.id}
                      onClick={() => handleCancelTicket(ticket.id)}
                      className="flex items-center space-x-1"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </AnimatedButton>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatedList>
        )}
      </AnimatedCard>
    </div>
  );
}
