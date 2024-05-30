import React from "react";
import {motion} from "framer-motion";
import {FlipWords} from "src/components/ui/flip-words";
import {MdArchitecture, FaPalette, FaCode} from "src/components/icons";
import {DockPanel} from "src/components/summary/DockPanel";

const container = (delayChildrenValue = 0, staggerChildrenValue = 0) => ({
  hidden: {opacity: 0},
  show: {
    opacity: 1,
    transition: {
      staggerChildren: staggerChildrenValue,
      delayChildren: delayChildrenValue,
      type: "tween",
    },
  },
});

const animateX = (fromX, durationAmount = 0.5) => ({
  hidden: {opacity: 0, x: fromX || 0},
  show: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      duration: durationAmount,
    },
  },
});

const slideUp = (fromY, delayAmount) => ({
  hidden: {opacity: 0, y: fromY || 0},
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "tween",
      duration: 0.5,
    },
  },
});

const fadeY = (fromY, delayAmount, durationAmount) => ({
  hidden: {opacity: 0, y: fromY || 0},
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "tween",
      duration: durationAmount || 0.5,
      delay: delayAmount || 0,
    },
  },
});

const words = [
  "crafting seamless user experiences",
  "building robust & scalable solutions",
  "leading innovative initiatives",
];

const Intro = () => {
  return (
    <motion.div
      variants={container(0, 0.4)}
      initial="hidden"
      whileInView="show"
      viewport={{once: true}}
      className="p-5 flex flex-col lg:justify-start lg:items-start justify-center items-center"
    >
      <motion.div
        variants={slideUp(50)}
        className="text-xl text-gray-500 dark:text-white pl-2 tracking-normal
                  font-poppins text-left flex justify-between w-full items-center md:flex-row flex-col-reverse"
      >
        <span className="align-bottom">Hello, I am</span>
        <DockPanel />
      </motion.div>
      <motion.h1
        variants={slideUp(50)}
        className="text-6xl lg:text-9xl md:text-8xl drop-shadow-2xl
                      uppercasepnpm dev
                      bg-clip-text
                      bg-gradient-to-r
                      from-secondary to-tertiary dark:to-white dark:from-secondary text-transparent
                      font-archivo"
      >
        Hardik
      </motion.h1>

      <motion.div
        variants={container(1, 0.2)}
        initial="hidden"
        whileInView="show"
        viewport={{once: true}}
        className="flex gap-2 w-full lg:pl-1
                  md:justify-start md:items-start md:flex-row flex-col justify-center items-center
                  lg:text-md text-sm font-archivo  tracking-[0.04rem]
                  dark:text-white font-medium
                  lg:pt-4 pt-2"
      >
        <motion.span
          variants={animateX(50)}
          className="bg-stone-300 dark:bg-gray-700 dark:text-white px-2 py-1 rounded-full flex gap-1 justify-center items-center"
        >
          <FaCode />
          Full Stack Developer
        </motion.span>
        <motion.span
          variants={animateX(50)}
          className="bg-stone-300 dark:bg-gray-700 dark:text-white px-2 py-1 rounded-full flex gap-1 justify-center items-center"
        >
          <MdArchitecture /> Engineer
        </motion.span>
        <motion.span
          variants={animateX(50)}
          className="bg-stone-300 dark:bg-gray-700 dark:text-white px-2 py-1 rounded-full flex gap-1 justify-center items-center"
        >
          <FaPalette /> Passionate For Frontend
        </motion.span>
      </motion.div>
      <motion.div
        variants={fadeY(50, 1.7, 1)}
        className="flex justify-start items-center lg:pl-1 lg:pt-4 pt-2"
      >
        <div
          className="hidden text-xl font-medium text-black dark:text-white
          lg:flex flex-col md:flex-row justify-center items-center md:justify-start md:items-start"
        >
          <span>My passion lies in</span>
          <FlipWords words={words} duration={5000} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Intro;
