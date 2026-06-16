import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import api from "../utils/api";
import { useParams } from "react-router-dom";
import socket from "../utils/socket";

const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
  const { roomCode } = useParams();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRoom = async () => {
    try {
      const res = await api.get(
        `http://localhost:5000/api/rooms/${roomCode}`,
        {
          withCredentials: true,
        }
      );

      setRoom(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roomCode) return;

    fetchRoom();

    socket.emit("join-room", roomCode);

    socket.on("room-updated", (updatedRoom) => {
      setRoom(updatedRoom);
    });

    return () => {
      socket.emit("leave-room", roomCode);
      socket.off("room-updated");
    };
  }, [roomCode]);

  return (
    <RoomContext.Provider
      value={{
        room,
        setRoom,
        loading,
        fetchRoom,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  return useContext(RoomContext);
};