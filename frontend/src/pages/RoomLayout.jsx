import { Outlet } from "react-router-dom";
import { RoomProvider } from "../context/RoomContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function RoomLayout() {
  return (
    <RoomProvider>
      <Outlet />
      <ToastContainer position="bottom-right" autoClose={2000} />
    </RoomProvider>
  );
}

export default RoomLayout;