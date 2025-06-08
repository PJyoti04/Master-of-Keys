import React from "react";
import "../App.css";

const Features = () => {
  return (
    <>
      <div className="bg-[#202327fd] h-auto w-full flex flex-col items-center text-white font-mono">
        {/* // Feature Header */}
        <div className="flex gap-4 items-center pt-4">
          <div className="w-10 h-10 rounded-full animate-bounce bg-[orange] "></div>
          <h1 className="text-5xl text-[orange] font-bold underline text-center ">
            What we Offer
          </h1>
        </div>

        {/* // Feature Boxes */}
        <div className="bg-[#202327fd] w-[80vw] py-14 grid grid-cols-5 grid-row-6 h-[100vh] gap-6 ">
          {/* //Daily Practice */}
          <section className="col-span-3 row-span-3 border rounded-[20px] border-[orange] bg-[url(./practice.png)] bg-cover flex flex-col-reverse group ">
            <div className="h-[30%] bg-[linear-gradient(to_top,black,#000000d0,#000000d7,transparent)] rounded-[20px] group-hover:h-[100%] hover:items-start font-extrabold text-orange-600 px-4 pt-4 flex justify-between transition-all duration-500 ">
              <span className="md:text-4xl text-2xl">Daily Practice</span>
              <span>
                <img className="md:w-[50px] w-[30px] " src="arrow.png" alt="arrow" />
              </span>
            </div>
          </section>

          {/* //Competitions */}
          <section className="col-span-2 row-span-3 border border-[orange] rounded-[20px] bg-[url(./rooms.png)] bg-cover flex-col-reverse flex group">
            <div className="h-[30%] bg-[linear-gradient(to_top,black,#000000d0,#000000d7,transparent)] rounded-[20px] group-hover:h-[100%] hover:items-start font-extrabold text-orange-600 px-4 pt-4 flex justify-between transition-all duration-500 ">
              <span className="md:text-4xl text-2xl">Competitions</span>
              <span>
                <img className="md:w-[50px] w-[30px] " src="arrow.png" alt="arrow" />
              </span>
            </div>
          </section>

          {/* //Multiplayer */}
          <section className="col-span-2 row-span-3 border border-[orange] rounded-[20px] bg-[url(./multiplayer.png)] bg-cover flex-col-reverse flex group">
            <div className="h-[30%] bg-[linear-gradient(to_top,black,#000000d0,#000000d7,transparent)] rounded-[20px] group-hover:h-[100%] hover:items-start font-extrabold text-orange-600 px-4 pt-4 flex justify-between transition-all duration-500 ">
              <span className="md:text-4xl text-2xl">Multiplayer</span>
              <span>
                <img className="md:w-[50px] w-[30px] " src="arrow.png" alt="arrow" />
              </span>
            </div>
          </section>

          {/* //Analysis */}
          <section className="col-span-3 row-span-3 border border-[orange] rounded-[20px] bg-[url(./analysis.png)] bg-cover flex-col-reverse flex group ">
            <div className="h-[30%] bg-[linear-gradient(to_top,black,#000000d0,#000000d7,transparent)] rounded-[20px] group-hover:h-[100%] hover:items-start  font-extrabold text-orange-600 px-4 pt-4 flex   justify-between transition-all duration-500 ">
              <span className="md:text-4xl text-2xl">Personalized Analysis</span>
              <span>
                <img className="md:w-[50px] w-[30px] " src="arrow.png" alt="arrow" />
              </span>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Features;
