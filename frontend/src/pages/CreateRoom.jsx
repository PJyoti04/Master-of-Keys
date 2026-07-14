import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Crown,
  Lock,
  Users,
  Clock,
  Eye,
  FileText,
  Sparkles,
  Pencil,
  Check,
  LoaderCircle,
} from "lucide-react";
import { toast } from "react-toastify";

import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { getRandomTypingText } from "../assets/typingTexts";

const createInitialText = () => {
  const firstParagraph = getRandomTypingText();
  const secondParagraph = getRandomTypingText(firstParagraph);

  return `${firstParagraph} ${secondParagraph}`;
};

function CreateRoom() {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [multiplayerText, setMultiplayerText] = useState(createInitialText);

  const isPremium =
    currentUser?.isPremium || currentUser?.subscription === "premium";

  const [formData, setFormData] = useState({
    roomName: "",
    maxPlayers: 4,
    duration: 60,
    visibility: "private",
    currentText: "",
  });

  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "roomName" && value.trim().length > 50) {
      toast.info("Room name cannot exceed 50 characters.");
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const selectMaxPlayers = (value) => {
    if (value > 4 && !isPremium) {
      toast.info("6, 8 and 10 player rooms are premium features.");
      return;
    }

    setFormData({
      ...formData,
      maxPlayers: value,
    });
  };

  const selectDuration = (value) => {
    if (value === "custom" && !isPremium) {
      toast.info("Custom duration is a premium feature.");
      return;
    }

    if (value === "custom") {
      setIsCustomDuration(true);
      return;
    }

    setIsCustomDuration(false);

    setFormData({
      ...formData,
      duration: value,
    });
  };

  const createRoom = async (e) => {
    e.preventDefault();

    const trimmedRoomName = formData.roomName.trim();

    if (!trimmedRoomName) {
      toast.error("Room name is required.");
      return;
    }

    if (trimmedRoomName.length > 50) {
      toast.error("Room name cannot exceed 50 characters.");
      return;
    }

    if (isCustomDuration && Number(formData.duration) <= 0) {
      toast.error("Duration must be greater than 0.");
      return;
    }

    setIsCreating(true);

    try {
      const payload = {
        ...formData,
        roomName: trimmedRoomName,
        maxPlayers: Number(formData.maxPlayers),
        duration: Number(formData.duration),
        currentText: isPremium ? formData.currentText.trim() : multiplayerText,
      };

      const res = await api.post("/rooms/create", payload, {
        withCredentials: true,
      });

      toast.success(`Room created! Code: ${res.data.room.roomCode}`);

      navigate(`/multiplayer/room/${res.data.room.roomCode}`, {
        replace: true,
      });
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Unable to create room.");
    }finally{
      setIsCreating(false);
    }
  };

  const premiumBadge = (
    <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 border border-orange-500/30 px-2 py-0.5 text-[11px] font-semibold text-orange-400">
      <Lock size={11} />
      Premium
    </span>
  );

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#181C22] text-white px-4 pt-4">
      <div className="flex items-center justify-center gap-8 ">
        <form
          onSubmit={createRoom}
          className="flex-1 border-white/10 rounded-3xl px-6 py-3 md:p-3"
        >
          <div className="mb-6 text-center">
            {/* <p className="text-orange-400 font-semibold mb-2 flex items-center gap-2">
              <Sparkles size={18} />
              Multiplayer Typing
            </p> */}

            <h1 className="text-3xl font-bold">Create Room</h1>

            <p className="text-zinc-400 mt-2 text-sm">
              Set up a typing race room and invite your friends using the room
              code.
            </p>
          </div>

          <div className="space-y-4 flex flex-col">
            <div>
              <label className="flex items-center justify-between text-sm text-zinc-300 mb-2">
                <span className="flex items-center gap-2">
                  <Pencil size={16} className="text-orange-400" />
                  Room Name
                </span>

                <span className="text-xs text-zinc-500">
                  {formData.roomName.trim().length}/50
                </span>
              </label>

              <input
                type="text"
                name="roomName"
                maxLength={50}
                placeholder="Example: Weekend Typing Battle"
                value={formData.roomName}
                onChange={handleChange}
                className="w-full bg-[#181C22] border border-white/10 focus:border-orange-500 outline-none text-white placeholder:text-zinc-500 px-4 py-3 rounded-2xl transition"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-zinc-300 mb-2">
                <Users size={16} className="text-orange-400" />
                Players Allowed
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[2, 4, 6, 8, 10].map((value) => {
                  const locked = value > 4 && !isPremium;
                  const active = Number(formData.maxPlayers) === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => selectMaxPlayers(value)}
                      className={`relative min-h-[56px] rounded-2xl border px-3 py-1 text-sm transition ${
                        active
                          ? "border-orange-500 bg-orange-500/15 text-orange-400"
                          : "border-white/10 bg-[#181C22] text-zinc-300 hover:border-orange-500/40"
                      } ${locked ? "opacity-75" : ""}`}
                    >
                      <span className="block font-semibold">
                        {value} Players
                      </span>

                      {locked && (
                        <span className="mt-1 flex justify-center">
                          {premiumBadge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {!isPremium && (
                <p className="mt-2 text-xs text-orange-400 flex items-center gap-1">
                  <Crown size={14} />
                  Upgrade to premium to create rooms with 6, 8 or 10 players.
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-zinc-300 mb-2">
                <Clock size={16} className="text-orange-400" />
                Race Duration
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: "30 Sec", value: 30 },
                  { label: "60 Sec", value: 60 },
                  { label: "120 Sec", value: 120 },
                  { label: "Custom", value: "custom", premium: true },
                ].map((item) => {
                  const locked = item.premium && !isPremium;
                  const active =
                    item.value === "custom"
                      ? isCustomDuration
                      : !isCustomDuration &&
                        Number(formData.duration) === Number(item.value);

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => selectDuration(item.value)}
                      className={`relative min-h-[56px] rounded-2xl border px-3 py-1 text-sm transition ${
                        active
                          ? "border-orange-500 bg-orange-500/15 text-orange-400"
                          : "border-white/10 bg-[#181C22] text-zinc-300 hover:border-orange-500/40"
                      } ${locked ? "opacity-75" : ""}`}
                    >
                      <span className="block font-semibold">{item.label}</span>

                      {locked && (
                        <span className="mt-1 flex justify-center">
                          {premiumBadge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {isCustomDuration && isPremium && (
                <input
                  type="number"
                  name="duration"
                  min="10"
                  max="86400"
                  placeholder="Enter duration in seconds"
                  value={formData.duration}
                  onChange={handleChange}
                  className="mt-3 w-full bg-[#181C22] border border-white/10 focus:border-orange-500 outline-none text-white placeholder:text-zinc-500 px-4 py-3 rounded-2xl transition"
                />
              )}
            </div>

            {/* <div>
              <label className="flex items-center gap-2 text-sm text-zinc-300 mb-2">
                <Eye size={16} className="text-orange-400" />
                Visibility
              </label>

              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="w-full bg-[#181C22] border border-white/10 focus:border-orange-500 outline-none text-white px-4 py-3 rounded-xl transition"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div> */}

            <div>
              <label className="flex items-center gap-2 text-sm text-zinc-300 mb-2">
                <FileText size={16} className="text-orange-400" />
                Custom Text
              </label>

              <div className="relative">
                <textarea
                  name="currentText"
                  rows="3"
                  placeholder="Paste your own typing challenge text..."
                  value={formData.currentText}
                  onChange={handleChange}
                  disabled={!isPremium}
                  className={`w-full bg-[#181C22] border border-white/10 focus:border-orange-500 outline-none text-white placeholder:text-zinc-500 px-4 py-3 rounded-xl transition resize-none ${
                    !isPremium
                      ? "blur-[1.5px] opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                />

                {!isPremium && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#181C22]/50 backdrop-blur-[1px] border border-white/10">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500 text-white font-semibold text-sm shadow-lg">
                      <Lock size={16} />
                      Premium Feature
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* <button
              type="submit"
              className="flex gap-5 items-center justify-center self-center bg-orange-500 hover:bg-orange-600 text-black text-sm font-semibold px-8 py-3.5 rounded-full transition shadow-lg shadow-orange-500/20"
            > */}
            {/* <Check /> */}
            {/* Create room */}
            {/* <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </button> */}
            <button
              type="submit"
              disabled={isCreating}
              aria-busy={isCreating}
              className="group relative self-center flex min-h-14 w-full items-center justify-center overflow-hidden rounded-2xl bg-orange-500 b-[#FF9100] px-6 font-sans text-sm font-bold text-[#181C22] shadow-[0_18px_45px_rgba(255,145,0,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ffa52e] hover:shadow-[0_22px_50px_rgba(255,145,0,0.28)] focus:outline-none focus:ring-2 focus:ring-[#FF9100]/40 focus:ring-offset-2 focus:ring-offset-[#181C22] disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

              <span className="relative flex items-center gap-2">
                {isCreating ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create room
                    <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </span>
            </button>
          </div>
        </form>

        <div className="relative flex-1 hidden lg:block rounded-3xl overflow-hidden">
          <img
            src="/create-room.png"
            alt="Typing room"
            className="h-full w-full object-contain"
          />

          {/* Top */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#181C22] to-transparent pointer-events-none" />

          {/* Bottom */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#181C22] to-transparent pointer-events-none" />

          {/* Left */}
          <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-[#181C22] to-transparent pointer-events-none" />

          {/* Right */}
          <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-[#181C22] to-transparent pointer-events-none" />

          {/* Soft vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_55%,rgba(24,28,34,0.8)_100%)] pointer-events-none" />

          {/* <div className="absolute top-6 left-0 right-0">
            <div className="bg-[#181C22]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4  h-60">
              <p className="text-orange-400 font-semibold mb-2">
                Race with friends
              </p>

              <h2 className="text-3xl font-bold mb-3">
                Create fast, private typing battles.
              </h2>

              <p className="text-zinc-300 text-sm leading-6">
                Share your room code, invite players, choose the race duration,
                and compete in real time with a live leaderboard.
              </p>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default CreateRoom;
