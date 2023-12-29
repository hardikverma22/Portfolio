import {motion} from "framer-motion";
import {forwardRef} from "react";

import bnwPic from "../assets/bnwPic.jpeg";
import pic from "../assets/pic.jpeg";

import {slideIn, textVariant} from "../constants/motion";
import ScrollButton from "./ScrollButton";

const AboutMe = forwardRef(({aboutMeRef}, ref) => {
  return (
    <section
      ref={aboutMeRef}
      className="pt-24 md:pt-0 relative flex gap-5 flex-col min-h-screen md:min-h-max md:h-screen justify-center items-center bg-white text-tertiary dark:bg-black dark:text-white"
    >
      <div className="z-0 bg-wave dark:bg-wave-dark absolute top-0 min-w-full min-h-full bg-no-repeat bg-cover"></div>
      <div className="my-20 md:my-0 z-10 flex gap-10 flex-col justify-start items-center w-full">
        <motion.div variants={textVariant(0.1)} initial="hidden" whileInView="show">
          <h2 className="text-4xl text-primary dark:text-white font-bold flex justify-center items-center uppercase">
            About Me
          </h2>
        </motion.div>
        <motion.div
          variants={slideIn("down", "", 0, 1)}
          initial={"hidden"}
          whileInView={"show"}
          className="z-10 bg-white relative dark:bg-[#232323] dark:text-white w-[70%] portrait:w-[90%] lg:w-[80%] mx-auto translate-y-24 shadow-lg dark:shadow-[#232323] rounded-xl flex flex-col md:flex-row justify-center items-center md:drop-shadow-lg"
        >
          <div className="flex justify-center items-end md:items-center md:justify-start p-5">
            <img src={pic} className="block dark:hidden md:w-48 md:h-64 w-40 h-52 rounded-xl" />
            <img src={bnwPic} className="hidden dark:block md:w-48 md:h-64 w-40 h-52 rounded-xl" />
          </div>
          <div className="p-5 md:w-full">
            <div className="text-lg leading-9  text-black dark:text-white">
              Embarking on an amazing journey as a Full Stack Developer, I bring a wealth of experience in crafting
              robust, scalable solutions that drive business success. As a Certified SAFe® 5 Practitioner, I seamlessly
              merge technical prowess with Agile methodologies to sculpt a unique project management approach. My career
              narrative unfolds through a relentless pursuit of honing problem-solving acumen, recognizing its pivotal
              role in navigating the relentless pace of technological evolution. Collaboration with cross-functional
              teams is not just a preference but a cornerstone of my professional ethos.
            </div>
          </div>
        </motion.div>
      </div>
      <ScrollButton ref={ref} />
    </section>
  );
});

export default AboutMe;
