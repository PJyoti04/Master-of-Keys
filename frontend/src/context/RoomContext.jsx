import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useParams } from "react-router-dom";

import api from "../utils/api";
import socket from "../utils/socket";
import { AuthContext } from "./AuthContext";

const RoomContext = createContext(null);

export const RoomProvider = ({ children }) => {
  const { roomCode } = useParams();

  const { userInfo, loading: authLoading } = useContext(AuthContext);

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketError, setSocketError] = useState("");

  const fetchRoom = useCallback(async () => {
    if (!roomCode) return;

    try {
      setLoading(true);

      const res = await api.get(`/rooms/${roomCode}`, {
        withCredentials: true,
      });

      setRoom(res.data);
    } catch (err) {
      console.error("Failed to fetch room:", err);
      setRoom(null);
    } finally {
      setLoading(false);
    }
  }, [roomCode]);

  useEffect(() => {
    if (authLoading) return;

    fetchRoom();
  }, [authLoading, fetchRoom]);

  useEffect(() => {
    if (authLoading) return;
    if (!roomCode) return;

    setSocketError("");

    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      setSocketConnected(true);

      socket.emit(
        "join-room",
        { roomCode },
        (response) => {
          if (!response?.success) {
            setSocketError(response?.message || "Failed to join socket room.");
            return;
          }

          if (response.room) {
            setRoom(response.room);
          }
        }
      );
    };

    const handleDisconnect = () => {
      setSocketConnected(false);
    };

    const handleConnectError = (err) => {
      setSocketConnected(false);
      setSocketError(err.message || "Socket connection failed.");
    };

    const handleRoomUpdated = (updatedRoom) => {
      setRoom(updatedRoom);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("room-updated", handleRoomUpdated);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.emit("leave-room", { roomCode });

      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("room-updated", handleRoomUpdated);
    };
  }, [roomCode, authLoading]);

  return (
    <RoomContext.Provider
      value={{
        room,
        setRoom,
        loading: loading || authLoading,
        fetchRoom,
        socketConnected,
        socketError,
        currentUser: userInfo,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const context = useContext(RoomContext);

  if (!context) {
    throw new Error("useRoom must be used inside RoomProvider");
  }

  return context;
};