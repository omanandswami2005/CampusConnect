import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Ticket,
  CheckCircle,
  AlertCircle,
  Zap,
  Edit,
  Trash2,
  Download,
} from "lucide-react";
import { api } from "../api";
import AnimatedButton from "../components/AnimatedButton";
import AnimatedCard from "../components/AnimatedCard";
import BlurText from "../components/BlurText";

export default function EventDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [isEditing, setIsEditing] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  // Edit form fields
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editVenue, setEditVenue] = useState("");
  const [editCapacity, setEditCapacity] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isClub = user?.role === "club";
  const isStudent = user?.role === "student";
  const isOwner = isClub && event?.clubId === user?.id;

  useEffect(() => {
    // Fetch event details
    api
      .get(`/events/${id}`)
      .then((res) => {
        setEvent(res.data);
        // Initialize edit form with current values
        setEditName(res.data.name || "");
        setEditDescription(res.data.description || "");
        setEditDate(res.data.date || "");
        setEditTime(res.data.time || "");
        setEditVenue(res.data.venue || "");
        setEditCapacity(res.data.capacity || "");
      })
      .catch(() => setEvent(null));

    // Fetch attendees if user is a club
    if (isClub) {
      api
        .get(`/tickets/event/${id}/attendees`)
        .then((res) => {
          setAttendees(res.data);
          console.log("Attendees loaded:", res.data);
        })
        .catch((err) => {
          console.error("Failed to load attendees:", err);
        });
    }
  }, [id, isClub]);

  // JWT-based one-click booking
  const handleQuickBooking = async () => {
    if (!isStudent) {
      setMsg("Please log in as a student to book tickets");
      setMsgType("error");
      setTimeout(() => setMsg(""), 3000);
      return;
    }

    setIsBooking(true);
    setMsg("");

    try {
      // Only send eventId - backend will get student info from JWT token
      const response = await api.post(`/tickets/book`, {
        eventId: id,
      });

      setMsg(`🎉 Successfully booked ticket for "${event.name}"!`);
      setMsgType("success");
      setTimeout(() => setMsg(""), 5000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to book ticket";
      setMsg(errorMsg);
      setMsgType("error");
      setTimeout(() => setMsg(""), 5000);
    } finally {
      setIsBooking(false);
    }
  };

  const exportExcel = async () => {
    try {
      const res = await api.get(`/tickets/export/${id}`, {
        responseType: "blob",
      });
      // Try to extract filename; fallback if header missing
      const cd = res.headers["content-disposition"] || "";
      const match = /filename\*?=(?:UTF-8'')?"?([^\";]+)"?/i.exec(cd);
      const filename = match
        ? decodeURIComponent(match[1])
        : `${event.name?.replace(/\s+/g, "_") || "tickets"}.xlsx`;
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      if (err.response?.status === 401) {
        setMsg("Please login as a club to export tickets");
      } else {
        setMsg("Export failed");
      }
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await api.put(`/events/${id}`, {
        name: editName,
        description: editDescription,
        date: editDate,
        time: editTime,
        venue: editVenue,
        capacity: parseInt(editCapacity),
      });
      setEvent(res.data);
      setIsEditing(false);
      setMsg("Event updated successfully!");
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to update event");
    }
  };

  const handleDeleteEvent = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await api.delete(`/events/${id}`);
      setMsg("Event deleted successfully! Redirecting...");
      setTimeout(() => nav("/"), 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to delete event");
    }
  };

  if (!event) return <div>Loading...</div>;

  return (
    <div className="grid gap-4">
      {/* Event Details Card */}
      <AnimatedCard className="glass" delay={0.1}>
        {!isEditing ? (
          <>
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-4">
                <motion.h1
                  className="text-3xl font-bold gradient-text"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {event.name}
                </motion.h1>

                <motion.p
                  className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  {event.description}
                </motion.p>

                {/* Event Details Grid */}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Date
                      </p>
                      <p className="font-semibold">{event.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Time
                      </p>
                      <p className="font-semibold">{event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Venue
                      </p>
                      <p className="font-semibold">{event.venue}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Capacity
                      </p>
                      <p className="font-semibold">{event.capacity} people</p>
                    </div>
                  </div>
                </motion.div>

                {/* Club Info */}
                <motion.div
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Organized by
                    </p>
                    <p className="font-bold text-lg">{event.clubName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Current Bookings
                    </p>
                    <p className="font-bold text-lg">
                      {attendees.length} / {event.capacity}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Edit & Delete buttons - Only for event owner */}
              {isOwner && (
                <motion.div
                  className="flex flex-col gap-2 ml-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <AnimatedButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </AnimatedButton>
                  <AnimatedButton
                    variant="danger"
                    size="sm"
                    onClick={handleDeleteEvent}
                    className="flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </AnimatedButton>
                </motion.div>
              )}
            </div>
          </>
        ) : (
          /* Edit Form */
          <form onSubmit={handleUpdateEvent} className="grid gap-3">
            <div className="font-semibold text-lg">Edit Event</div>
            <input
              className="input"
              placeholder="Event Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
            <textarea
              className="input"
              placeholder="Description"
              rows={3}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              required
            />
            <input
              type="date"
              className="input"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              required
            />
            <input
              type="time"
              className="input"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
              required
            />
            <input
              className="input"
              placeholder="Venue"
              value={editVenue}
              onChange={(e) => setEditVenue(e.target.value)}
              required
            />
            <input
              type="number"
              className="input"
              placeholder="Capacity"
              value={editCapacity}
              onChange={(e) => setEditCapacity(e.target.value)}
              required
            />
            <div className="flex gap-2">
              <button
                className="btn bg-green-500 hover:bg-green-600"
                type="submit"
              >
                Save Changes
              </button>
              <button
                className="btn bg-gray-500 hover:bg-gray-600"
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setMsg("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {msg && <div className="text-sm mt-2 text-blue-600">{String(msg)}</div>}
      </AnimatedCard>

      {/* Message Display */}
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

      {/* One-Click Booking - Only for students */}
      {isStudent && (
        <AnimatedCard className="glass text-center" delay={0.3}>
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Ticket className="w-6 h-6 text-blue-500" />
              <BlurText
                text="Quick Booking Available"
                className="text-xl font-bold gradient-text"
                animateBy="words"
              />
            </div>

            <BlurText
              text="Book your ticket instantly with one click!"
              className="text-gray-600 dark:text-gray-400"
              delay={0.2}
            />

            <AnimatedButton
              onClick={handleQuickBooking}
              loading={isBooking}
              className="flex items-center justify-center space-x-2 px-8 py-3"
              size="lg"
            >
              <Zap className="w-5 h-5" />
              <span>Book Ticket Now</span>
            </AnimatedButton>

            <p className="text-xs text-gray-500 dark:text-gray-500">
              Logged in as {user?.name} • Instant confirmation
            </p>
          </div>
        </AnimatedCard>
      )}

      {/* Login Prompt - For non-logged in users */}
      {!isStudent && !isClub && (
        <AnimatedCard className="glass text-center" delay={0.3}>
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Ticket className="w-6 h-6 text-gray-400" />
              <BlurText
                text="Want to Book This Event?"
                className="text-xl font-bold"
                animateBy="words"
              />
            </div>

            <BlurText
              text="Log in as a student to book tickets instantly!"
              className="text-gray-600 dark:text-gray-400"
              delay={0.2}
            />

            <AnimatedButton
              onClick={() => nav("/club")}
              className="flex items-center justify-center space-x-2 px-8 py-3"
              size="lg"
            >
              <Users className="w-5 h-5" />
              <span>Login to Book</span>
            </AnimatedButton>
          </div>
        </AnimatedCard>
      )}

      {/* Club Management Tools - Only for clubs */}
      {isClub && (
        <AnimatedCard className="glass" delay={0.4}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-blue-500" />
              <BlurText
                text="Club Management"
                className="text-xl font-bold"
                animateBy="words"
              />
            </div>
            <AnimatedButton
              onClick={exportExcel}
              variant="secondary"
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Excel</span>
            </AnimatedButton>
          </div>

          {/* Registered Students List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Registered Students</h3>
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                {attendees.length} / {event.capacity}
              </span>
            </div>

            {attendees.length === 0 ? (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <BlurText
                  text="No registrations yet"
                  className="text-lg font-semibold text-gray-500"
                />
                <BlurText
                  text="Students will appear here once they book tickets"
                  className="text-gray-400 mt-2"
                  delay={0.2}
                />
              </motion.div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                      <tr>
                        <th className="text-left p-4 font-semibold">#</th>
                        <th className="text-left p-4 font-semibold">
                          Student Name
                        </th>
                        <th className="text-left p-4 font-semibold">Email</th>
                        <th className="text-left p-4 font-semibold">
                          Booked At
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendees.map((attendee, index) => (
                        <motion.tr
                          key={attendee.id}
                          className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <td className="p-4 font-medium">{index + 1}</td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {attendee.studentName.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium">
                                {attendee.studentName}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-gray-600 dark:text-gray-400">
                            {attendee.email}
                          </td>
                          <td className="p-4 text-gray-600 dark:text-gray-400">
                            {new Date(attendee.bookingTime).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </AnimatedCard>
      )}
    </div>
  );
}
