import React from "react";
import Navbar from "./Navbar";

const HeroSection = () => {
  return (
    <>
      <div className="h-[100vh] bg-gradient-to-t from-[#252134e8] from-20%  via-slate-800 via-70% to-slate-900 ">
        <div className="h-[inherit] bg-[url(bg.svg)]">
          <Navbar />
        </div>
      </div>
    </>
  );
};



export default HeroSection;
