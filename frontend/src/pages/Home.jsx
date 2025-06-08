import React from "react";
import "../App.css";
import { Link } from "react-router-dom";
import Features from "../components/Features"
const Home = () => {
  return (
    <>
      <div className="h-[88vh] bg-[#181C22] flex justify-center items-center font-mono text-white">
        <div className="w-[60vw] px-8 typewriter">
          <h1 className="text-7xl font-bold py-5 ">
            master of keys
          </h1>
          <p className="text-xl font-bold text-center ">
            Test & improve your typing speed through practice , competition and
            detailed progress tracking.
          </p>
          <div className="flex justify-center gap-16 py-10">
            <button className="border rounded-md px-4 py-2 text-xl bg-[orange] hover:bg-[#ff8400e7] "><Link to='/practice'>Practice</Link></button>
            <button className="border rounded-md px-3 py-2 text-xl hover:bg-[#a4a0a01b] "><Link to='/multiplayer'>Compete</Link></button>
          </div>
        </div>
        <div className="kb-container">
          <img
            className="border-white w-[50vw] kb "
            src="./Dark_kb-Picsart-BackgroundRemover.png"
            alt="keyboard image"
          />
        </div>
      </div>
      <Features />
    </>
  );
};

export default Home;
