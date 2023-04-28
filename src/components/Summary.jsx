import { motion } from "framer-motion";
import { forwardRef } from "react";
import Typed from "react-typed";
import { slideIn } from "../motion";
import { AiFillHeart } from "./Icons";
import ModelCanvas from "./Model/Computers";
import ScrollButton from "./ScrollButton";
import SocialMediaButtons from "./SocialMediaButtons";

const Summary = forwardRef(({ summaryRef }, ref) => {
  return (
    <>
      <section ref={summaryRef}>
        {/* landscape */}
        <div className="portrait:hidden mt-24 md:mt-0 md:px-14 z-100 w-full h-screen flex flex-col items-center justify-center gap-6 md:flex-row item-center px-5 bg-white dark:bg-black overflow-y-hidden">
          <div className="flex flex-col gap-4 items-center justify-center md:justify-end pt-14 md:pt-0 md:w-[50%] w-full">
            <motion.div
              variants={slideIn("left", "spring", 0.5, 0.5)}
              initial={"hidden"}
              whileInView={"show"}
              className="w-full flex flex-col justify-center items-center md:items-start gap-2"
            >
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
                  className="font-bold md:pl-3 pl-2 text-gray-500 dark:text-white"
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
            </motion.div>
            <motion.div className="flex md:justify-start justify-center item-center w-full">
              <SocialMediaButtons />
            </motion.div>
          </div>
          <div className="z-[100] flex items-start justify-center md:justify-start md:items-center h-full lg:items-end md:w-[50%]">
            <ModelCanvas isLandscape={true} />
          </div>
          <ScrollButton ref={ref} />
        </div>
        {/* Portrait mostly for ipads */}
        <div className="landscape:hidden portrait:flex mt-24 md:px-14 px-5 z-100 w-full h-screen flex-col justify-center items-center gap-6  bg-white dark:bg-black overflow-hidden">
          <div className="flex flex-col gap-4 items-center justify-center py-28 lg:pt-0 w-full">
            <motion.div
              variants={slideIn("up", "spring", 0.5, 0.5)}
              initial={"hidden"}
              whileInView={"show"}
              className="w-fit flex flex-col justify-center items-center md:items-start gap-2"
            >
              <div className="md:text-7xl text-xl text-gray-500 font-normal dark:text-white">
                Hello I am
              </div>
              <div className="md:text-7xl text-3xl uppercase font-bold bg-clip-text bg-gradient-to-r from-secondary to-tertiary text-transparent">
                hardik Verma
              </div>
              <div className="md:text-2xl text-lg uppercase tracking-[0.15rem] dark:text-white">
                Full Stack developer
              </div>
              <div className="text-xl flex items-center justify-start w-full dark:text-white">
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
              <motion.div className="flex md:justify-start justify-center item-center w-full">
                <SocialMediaButtons />
              </motion.div>
            </motion.div>
          </div>
          <div className="flex items-start justify-center md:justify-center h-full lg:items-end w-full">
            <ModelCanvas isLandscape={false} />
          </div>
          <ScrollButton ref={ref} />
        </div>
      </section>
    </>
  );
});

export default Summary;
