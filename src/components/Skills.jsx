import { forwardRef, useEffect, useRef } from "react";
import { FaAws, FaNodeJs, FaReact } from "react-icons/fa";
import {
  SiDocker,
  SiDotnet,
  SiFirebase,
  SiGraphql,
  SiTailwindcss,
} from "react-icons/si";
import { TbBrandMongodb, TbBrandTypescript } from "react-icons/tb";
import { useInViewport } from "react-in-viewport";
import ScrollButton from "./ScrollButton";
import SkillCard from "./SkillCard";

import { motion } from "framer-motion";
import { staggerContainer, textVariant } from "../motion";

const skillset = [
  {
    title: "React.js",
    icon: FaReact,
    animationDelay: "0.2",
  },
  {
    title: "Node.js",
    icon: FaNodeJs,
    animationDelay: "0.4",
  },
  {
    title: "Typescript",
    icon: TbBrandTypescript,
    animationDelay: "0.6",
  },

  {
    title: "TailwindCSS",
    icon: SiTailwindcss,
    animationDelay: "0.8",
  },

  {
    title: "MongoDB",
    icon: TbBrandMongodb,
    animationDelay: "1",
  },

  {
    title: "Firebase",
    icon: SiFirebase,
    animationDelay: "1.2",
  },

  {
    title: "GraphQL",
    icon: SiGraphql,
    animationDelay: "1.4",
  },

  {
    title: "Dot Net",
    icon: SiDotnet,
    animationDelay: "1.6",
  },

  {
    title: "Docker",
    icon: SiDocker,
    animationDelay: "1.8",
  },

  { title: "AWS", icon: FaAws, animationDelay: "1.8" },
];

const Skills = forwardRef(({ setMoveImg, skillRef }, ref) => {
  const skillheadingRef = useRef();
  const { inViewport: headingInViewPort } = useInViewport(skillheadingRef);

  useEffect(() => {
    setMoveImg(headingInViewPort);
  }, [headingInViewPort]);

  return (
    <section
      ref={skillRef}
      className="pt-24 md:pt-0 z-50 relative flex flex-col gap-10 h-screen w-full justify-center items-center bg-tertiary dark:bg-[#232323]"
    >
      <div className="-z-10 bg-wave-white dark:bg-wave-black absolute -top-5 min-w-full min-h-full bg-no-repeat bg-cover"></div>
      <motion.div
        variants={textVariant(0.1)}
        initial="hidden"
        whileInView="show"
      >
        <h2
          ref={skillheadingRef}
          className="z-50 text-4xl text-white font-bold flex justify-center items-center uppercase"
        >
          Skills
        </h2>
      </motion.div>

      <motion.div
        variants={staggerContainer()}
        initial={"hidden"}
        whileInView={"show"}
        className="grid grid-cols-3 md:grid-cols-5 sm:grid-cols-3 gap-10 ease-in transition duration-300"
      >
        {skillset.map((skill, index) => (
          <SkillCard
            key={skill.title}
            title={skill.title}
            Icon={skill.icon}
            index={index}
          />
        ))}
      </motion.div>

      <ScrollButton isLight={true} ref={ref} />
    </section>
  );
});

export default Skills;
