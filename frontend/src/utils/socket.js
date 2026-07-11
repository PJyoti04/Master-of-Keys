// import { io } from "socket.io-client";

// const socket = io("http://localhost:5000", {
//   withCredentials: true,
//   autoConnect: true,
// });

// export default socket;

import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
                        || "https://master-of-keys-7b7d.vercel.app" 
                        // || "http://localhost:5000";

const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
  transports: ["websocket"],
});

export default socket;