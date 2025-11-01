import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Eye,
  Search,
  Filter,
  Ticket,
  CheckCircle,
  AlertCircle,
  Zap,
} from "lucide-react";
import { api } from "../api";
import AnimatedCard from "../components/AnimatedCard";
import AnimatedList from "../components/AnimatedList";
import AnimatedButton from "../components/AnimatedButton";
import BlurText from "../components/BlurText";
import CountUp from "../components/CountUp";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [bookingEvent, setBookingEvent] = useState(null);
  const [bookingMessage, setBookingMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  // Get current user
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isStudent = user?.role === "student";

  useEffect(() => {
    api
      .get("/events")
      .then((res) => {
        setEvents(res.data);
        setFilteredEvents(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const filtered = events.filter(
      (event) =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.clubName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [searchTerm, events]);

  // Quick booking function
  const handleQuickBooking = async (eventId, eventName) => {
    if (!isStudent) {
      setBookingMessage("Please log in as a student to book tickets");
      setMessageType("error");
      setTimeout(() => setBookingMessage(""), 3000);
      return;
    }

    setBookingEvent(eventId);
    setBookingMessage("");

    try {
      // Only send eventId - backend will get student info from JWT token
      const response = await api.post(`/tickets/book`, {
        eventId: eventId,
      });

      setBookingMessage(`🎉 Successfully booked ticket for "${eventName}"!`);
      setMessageType("success");
      setTimeout(() => setBookingMessage(""), 5000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to book ticket";
      setBookingMessage(errorMsg);
      setMessageType("error");
      setTimeout(() => setBookingMessage(""), 5000);
    } finally {
      setBookingEvent(null);
    }
  };

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
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <BlurText
            text="Loading amazing events..."
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
          text="Discover Campus Events"
          className="text-4xl md:text-5xl font-bold gradient-text"
          animateBy="words"
          stagger={0.1}
        />
        <BlurText
          text={
            isStudent
              ? "Connect with your campus community through exciting events and activities. Click 'Quick Book' for instant registration!"
              : "Connect with your campus community through exciting events and activities"
          }
          className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          delay={0.3}
          animateBy="words"
        />

        {isStudent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-full px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400"
          >
            <Ticket className="w-4 h-4" />
            <span>Logged in as Student - Quick booking enabled!</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
          </motion.div>
        )}
      </motion.div>

      {/* Booking Message */}
      {bookingMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={`
            p-4 rounded-lg border flex items-center space-x-3 max-w-2xl mx-auto
            ${
              messageType === "success"
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
            }
          `}
        >
          {messageType === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{bookingMessage}</span>
        </motion.div>
      )}

      {/* Stats Section */}
      {events.length > 0 && (
        <AnimatedCard className="glass text-center" delay={0.2}>
          <div
            className={`grid grid-cols-1 ${
              isStudent ? "md:grid-cols-4" : "md:grid-cols-3"
            } gap-6`}
          >
            <div>
              <CountUp
                end={events.length}
                className="text-3xl font-bold text-blue-600 dark:text-blue-400"
                duration={1.5}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Total Events
              </p>
            </div>
            <div>
              <CountUp
                end={events.reduce((sum, e) => sum + e.capacity, 0)}
                className="text-3xl font-bold text-purple-600 dark:text-purple-400"
                duration={2}
                separator=","
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Total Capacity
              </p>
            </div>
            <div>
              <CountUp
                end={new Set(events.map((e) => e.clubName)).size}
                className="text-3xl font-bold text-green-600 dark:text-green-400"
                duration={1.8}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Active Clubs
              </p>
            </div>
            {isStudent && (
              <div>
                <motion.div
                  className="text-3xl font-bold text-orange-600 dark:text-orange-400 flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap className="w-8 h-8" />
                </motion.div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Quick Booking
                </p>
              </div>
            )}
          </div>
        </AnimatedCard>
      )}

      {/* Search and Filter */}
      <AnimatedCard className="glass" delay={0.3}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="    Search events, clubs, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <AnimatedButton
            variant="secondary"
            className="flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </AnimatedButton>
        </div>
      </AnimatedCard>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <AnimatedList
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          stagger={0.1}
        >
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card h-full flex flex-col group">
                {/* Event Header */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <motion.h3
                      className="font-bold text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      {event.name}
                    </motion.h3>
                    <motion.div
                      className="w-2 h-2 bg-green-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{event.date}</span>
                      <Clock className="w-4 h-4 ml-2" />
                      <span>{event.time}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{event.venue}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>Capacity: {event.capacity}</span>
                      </div>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                        {event.clubName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {isStudent ? (
                    <div className="flex gap-2">
                      <AnimatedButton
                        onClick={() => handleQuickBooking(event.id, event.name)}
                        loading={bookingEvent === event.id}
                        className="flex-1 flex items-center justify-center space-x-2"
                        variant="primary"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Quick Book</span>
                      </AnimatedButton>
                      <Link to={`/events/${event.id}`}>
                        <AnimatedButton
                          className="flex items-center justify-center space-x-2 px-4"
                          variant="secondary"
                        >
                          <Eye className="w-4 h-4" />
                        </AnimatedButton>
                      </Link>
                    </div>
                  ) : (
                    <Link to={`/events/${event.id}`} className="block">
                      <AnimatedButton
                        className="w-full flex items-center justify-center space-x-2"
                        variant="primary"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </AnimatedButton>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatedList>
      ) : (
        <AnimatedCard className="text-center py-12" delay={0.4}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center"
          >
            <Calendar className="w-12 h-12 text-gray-400" />
          </motion.div>
          <BlurText
            text={
              searchTerm
                ? "No events match your search"
                : "No events available yet"
            }
            className="text-xl font-semibold text-gray-600 dark:text-gray-400"
            delay={0.3}
          />
          <BlurText
            text={
              searchTerm
                ? "Try adjusting your search terms"
                : "Check back soon for exciting campus events!"
            }
            className="text-gray-500 dark:text-gray-500 mt-2"
            delay={0.5}
          />
          {searchTerm && (
            <AnimatedButton
              onClick={() => setSearchTerm("")}
              variant="secondary"
              className="mt-4"
            >
              Clear Search
            </AnimatedButton>
          )}
        </AnimatedCard>
      )}
    </div>
  );
}
