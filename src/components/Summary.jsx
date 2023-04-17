import { AiFillHeart } from "react-icons/ai";
import { FaDownload } from "react-icons/fa";
import Typed from "react-typed";
import Illustration from "../assets/Illustration.png";
import resume from "../assets/resume.pdf";
import ScrollButton from "./ScrollButton";
import { forwardRef, useEffect, useRef } from "react";

const Summary = forwardRef(({ moveImg, summaryRef }, ref) => {
  return (
    <>
      <section
        ref={summaryRef}
        className="portrait:hidden mt-24 md:mt-0 md:px-14 z-100 w-full h-screen flex flex-col items-center justify-center gap-6 md:flex-row item-center px-5 bg-white dark:bg-black"
      >
        <div className="flex items-center justify-center md:justify-end pt-14 md:pt-0 lg:w-[50%] w-full">
          <div className="w-full flex flex-col justify-center items-center md:items-start gap-2">
            <div className="text-xl lg:text-2xl text-gray-500 font-normal dark:text-white">
              Hello I am
            </div>
            <div className="text-3xl lg:text-7xl uppercase font-bold bg-clip-text bg-gradient-to-r from-secondary to-tertiary text-transparent">
              hardik Verma
            </div>
            <div className="text-base uppercase tracking-[0.15rem] dark:text-white">
              Full Stack developer
            </div>
            <div className="text-xl flex justify-center items-center md:justify-start w-full dark:text-white">
              <span className="flex items-center justify-center font-bold">
                I <AiFillHeart className="ml-2 text-red-600" />
              </span>
              <Typed
                className="font-bold md:pl-3 pl-2"
                strings={[
                  "Building Rich User Interfaces",
                  "Problem Solving",
                  "Collaboration",
                ]}
                typeSpeed={80}
                backSpeed={50}
                loop
              />
            </div>
            <a
              href={resume}
              download
              className="flex gap-2 bg-tertiary rounded-lg p-2 text-white hover:shadow-sm hover:shadow-teal-950 duration-75 hover:scale-105"
            >
              <FaDownload className="text-xl" />
              <span>Resume</span>
            </a>
          </div>
        </div>
        <div className="z-100 flex items-start justify-center md:justify-start h-full lg:items-end lg:w-[50%]">
          <img
            src={Illustration}
            className={`z-[100] w-[40rem] md:w-[26rem] lg:w-[32rem] xl:w-[64rem] duration-500 ${
              moveImg ? `xl:translate-y-24 lg:translate-y-16` : ""
            }`}
          />
        </div>
        <ScrollButton ref={ref} />
      </section>
      <section
        ref={summaryRef}
        className="landscape:hidden hidden md:flex mt-24 md:px-14 px-5 z-100 w-full h-screen flex-col justify-center items-center gap-6  bg-white dark:bg-black"
      >
        <div className="flex items-center justify-center pt-14 md:pt-0 w-full h-full">
          <div className="w-fit flex flex-col justify-center items-center md:items-start gap-2">
            <div className="text-5xl text-gray-500 font-normal dark:text-white">
              Hello I am
            </div>
            <div className="text-7xl uppercase font-bold bg-clip-text bg-gradient-to-r from-secondary to-tertiary text-transparent">
              hardik Verma
            </div>
            <div className="text-2xl uppercase tracking-[0.15rem] dark:text-white">
              Full Stack developer
            </div>
            <div className="text-2xl flex items-center justify-start w-full dark:text-white">
              <span className="flex items-center justify-center font-bold">
                I <AiFillHeart className="ml-2 text-red-600" />
              </span>
              <Typed
                className="font-bold md:pl-3 pl-2"
                strings={[
                  "Building Rich User Interfaces",
                  "Problem Solving",
                  "Collaboration",
                ]}
                typeSpeed={80}
                backSpeed={50}
                loop
              />
            </div>
            <a
              href={resume}
              download
              className="w-fit flex items-center justify-start text-3xl gap-2 bg-tertiary rounded-lg p-4 mt-5 text-white hover:shadow-sm hover:shadow-teal-950 duration-75 hover:scale-105"
            >
              <FaDownload className="text-2xl" />
              <span>Resume</span>
            </a>
          </div>
        </div>
        <div className="flex items-start justify-center md:justify-start h-full lg:items-end">
          <img
            src={Illustration}
            className={` w-[52rem] duration-500 ${
              moveImg ? `xl:translate-y-24 lg:translate-y-16` : ""
            }`}
          />
        </div>
        <ScrollButton ref={ref} />
      </section>
    </>
  );
});

export default Summary;
