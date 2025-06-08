import React from "react";

const Footer = () => {
  return (
    <>
      <div className="bg-[#181c22f2] px-6 font-mono text-white">
        <div className="border-t-2 border-[#ffa500] flex flex-col justify-center text-center pt-6 ">
          <ul className="cursor-pointer ">
            <li>
              <span
              className="hover:underline-offset-1 hover:underline hover:text-[orange] "
              >About Us
              </span>
            </li>
            <li>
              <span
              className="hover:underline-offset-1 hover:underline hover:text-[orange] "
              >Contact Us</span>
            </li>
          </ul>
          <p>For Feedback and Queries:</p>
          <div className="flex justify-center cursor-pointer py-2 gap-10 ">
            <img
              className="w-[50px] hover:translate-y-1 "
              src="./icons8-github-200.png"
              alt="github"
            />
            <img
              className="w-[50px] hover:translate-y-1 "
              src="./icons8-gmail-200.png"
              alt="gmail"
            />
            <img
              className="w-[50px] hover:translate-y-1 "
              src="./icons8-instagram-200.png"
              alt="instagram"
            />
          </div>
          <p>
            All rights reserved.Copyright ©️2025{" "}
            <span className="text-[orange] hover:underline cursor-pointer">
              m.o.k
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default Footer;
