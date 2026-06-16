import { Outlet } from "react-router-dom";
import { RoomProvider } from "../context/RoomContext";

function RoomLayout() {
  return (
    <RoomProvider>
      <Outlet />
    </RoomProvider>
  );
}

export default RoomLayout;