// import { io } from "socket.io-client";

// const socket = io("http://localhost:5000", {
//   withCredentials: true,
//   autoConnect: true,
// });

// export default socket;

import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ||"http://192.168.0.57:5000" //|| "http://localhost:5000";

const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
  transports: ["websocket"],
});

export default socket;