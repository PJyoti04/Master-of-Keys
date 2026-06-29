import { useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

function CreateRoom() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    roomName: "",
    maxPlayers: 5,
    duration: 60,
    visibility: "public",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const createRoom = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post(
        "/rooms/create",
        formData,
        {
          withCredentials: true,
        }
      );

      navigate(`/multiplayer/room/${res.data.room.roomCode}`);

      // console.log(res.data);

      alert(
        `Room Created! Code: ${res.data.room.roomCode}`
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#181C22]">
      <form
        onSubmit={createRoom}
        className="bg-[#222831] p-8 rounded-xl w-[450px]"
      >
        <h1 className="text-white text-2xl mb-6">
          Create Room
        </h1>

        <input
          type="text"
          name="roomName"
          placeholder="Room Name"
          value={formData.roomName}
          onChange={handleChange}
          className="w-full mb-4 p-3 rounded"
        />

        <select
          name="maxPlayers"
          value={formData.maxPlayers}
          onChange={handleChange}
          className="w-full mb-4 p-3 rounded"
        >
          <option value="2">2 Players</option>
          <option value="3">3 Players</option>
          <option value="4">4 Players</option>
          <option value="5">5 Players</option>
          <option value="10">10 Players</option>
        </select>

        <select
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          className="w-full mb-4 p-3 rounded"
        >
          <option value="30">30 Seconds</option>
          <option value="60">60 Seconds</option>
          <option value="120">120 Seconds</option>
        </select>

        <select
          name="visibility"
          value={formData.visibility}
          onChange={handleChange}
          className="w-full mb-6 p-3 rounded"
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded"
        >
          Create Room
        </button>
      </form>
    </div>
  );
}

export default CreateRoom;