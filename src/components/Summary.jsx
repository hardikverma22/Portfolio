import { AiFillHeart } from "react-icons/ai";
import { FaDownload } from "react-icons/fa";
import Typed from "react-typed";
import Illustration from "../assets/Illustration.png";
import resume from "../assets/resume.pdf";
import ScrollButton from "./ScrollButton";

const Summary = ({ moveImg }) => {
  return (
    <section className="z-100 w-full h-screen pt-24 md:pt-0 flex flex-col items-center justify-center gap-12 md:flex-row item-center px-10 bg-white dark:bg-black">
      <div className="flex items-center justify-center md:justify-end pt-14 md:pt-0 md:w-[50%]">
        <div className="w-full lg:w-auto flex flex-col justify-center items-center md:items-start gap-2">
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
      <div className="z-100 flex items-center justify-center md:justify-start md:items-end h-full md:w-[50%]">
        {/* <ComputersCanvas /> */}
        <img
          src={Illustration}
          className={`z-[100] max-w-md md:max-w-lg lg:max-w-xl xl:max-w-5xl duration-500 ${
            moveImg ? "md:translate-y-28 translate-y-[4.5rem]" : ""
          }`}
        />
      </div>
      <ScrollButton pageNo={1} />
    </section>
  );
};

export default Summary;
