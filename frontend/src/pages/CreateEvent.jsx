import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function CreateEvent() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isClub = user?.role === "club";

  const [form, setForm] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    capacity: 100,
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!isClub) nav("/club");
  }, [isClub, nav]);

  const change = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    // Debug: Check if token exists
    const token = localStorage.getItem("token");
    console.log("Token in localStorage:", token ? "EXISTS" : "MISSING");
    console.log("User data:", user);

    if (!token) {
      setMsg("Please login first - no authentication token found");
      setTimeout(() => nav("/club"), 1500);
      return;
    }

    try {
      const payload = { ...form, capacity: Number(form.capacity) };
      const res = await api.post("/events/create", payload);
      setMsg("Event created!");
      setTimeout(() => nav(`/events/${res.data.id}`), 700);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.response?.data || "Failed";
      setMsg(String(errorMsg));
    }
  };

  if (!isClub) return null;

  return (
    <div className="card max-w-xl mx-auto">
      <div className="font-semibold mb-2">Create Event</div>
      <form onSubmit={submit} className="grid gap-3">
        <input
          className="input"
          placeholder="Event Name"
          value={form.name}
          onChange={(e) => change("name", e.target.value)}
          required
        />
        <textarea
          className="input"
          placeholder="Description"
          value={form.description}
          onChange={(e) => change("description", e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            className="input"
            value={form.date}
            onChange={(e) => change("date", e.target.value)}
            required
          />
          <input
            type="time"
            className="input"
            value={form.time}
            onChange={(e) => change("time", e.target.value)}
            required
          />
        </div>
        <input
          className="input"
          placeholder="Venue"
          value={form.venue}
          onChange={(e) => change("venue", e.target.value)}
          required
        />
        <input
          type="number"
          min="1"
          className="input"
          placeholder="Capacity"
          value={form.capacity}
          onChange={(e) => change("capacity", e.target.value)}
          required
        />
        <button className="btn" type="submit">
          Create
        </button>
        {msg && <div className="text-sm">{String(msg)}</div>}
      </form>
    </div>
  );
}
