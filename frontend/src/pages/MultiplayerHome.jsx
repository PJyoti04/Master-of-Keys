import React from "react";
import { Link } from "react-router-dom";

function MultiplayerHome() {
  return (
    <div className="bg-[#181C22] font-mono text-white min-h-[80vh] ">
        <div className="h-[] w-screen flex justify-center ">
            <img className="w-[60%] h-[40vh] " src="./multiplayer.png" alt="multiplayer" />
        </div>
      <h1 className="text-4xl text-[orange] text-center font-bold">
        master of keys
      </h1>
      <h1 className="text-3xl font-bold mb-4 text-center">Multiplayer Mode</h1>

      <div className="flex justify-center gap-4 mb-6">
        <Link
          to="create"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Create Room
        </Link>
        <Link
          to="join"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Join Room
        </Link>
      </div>
    </div>
  );
}

export default MultiplayerHome;
