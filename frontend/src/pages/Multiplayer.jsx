import React from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Multiplayer() {
  return (
    <div>
      <Outlet />
      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
}

export default Multiplayer;
