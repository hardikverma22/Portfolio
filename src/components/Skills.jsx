import { useEffect, useRef } from "react";
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

const skillset = [
  {
    title: "React.js",
    icon: FaReact,
    animationDelay: "animation-delay-200",
  },
  {
    title: "Node.js",
    icon: FaNodeJs,
    animationDelay: "animation-delay-400",
  },
  {
    title: "Typescript",
    icon: TbBrandTypescript,
    animationDelay: "animation-delay-600",
  },

  {
    title: "Tailwind CSS",
    icon: SiTailwindcss,
    animationDelay: "animation-delay-800",
  },

  {
    title: "Mongo DB",
    icon: TbBrandMongodb,
    animationDelay: "animation-delay-1000",
  },

  {
    title: "Firebase",
    icon: SiFirebase,
    animationDelay: "animation-delay-1200",
  },

  {
    title: "GraphQL",
    icon: SiGraphql,
    animationDelay: "animation-delay-1400",
  },

  {
    title: "Dot Net",
    icon: SiDotnet,
    animationDelay: "animation-delay-1600",
  },

  {
    title: "Docker",
    icon: SiDocker,
    animationDelay: "animation-delay-1800",
  },

  { title: "AWS", icon: FaAws, animationDelay: "animation-delay-2000" },
];

const Skills = ({ setMoveImg }) => {
  const skillSectionRef = useRef();
  const { inViewport } = useInViewport(skillSectionRef, {
    rootMargin: "-300px",
  });

  const skillheadingRef = useRef();
  const { inViewport: headingInViewPort } = useInViewport(skillheadingRef, {
    // rootMargin: "-300px",
  });

  useEffect(() => {
    setMoveImg(headingInViewPort);
  }, [headingInViewPort]);

  return (
    <section
      id="skills"
      ref={skillSectionRef}
      className="z-50 relative flex flex-col gap-10 h-screen justify-start items-center md:pt-40 pt-32 bg-tertiary dark:bg-[#232323]"
    >
      <div className="-z-10 bg-wave-white dark:bg-wave-black absolute top-0 min-w-full min-h-full bg-no-repeat bg-cover"></div>
      <h2
        ref={skillheadingRef}
        className="z-50 text-4xl text-white font-bold flex justify-center items-center uppercase"
      >
        Skills
      </h2>

      <div
        className={`${
          inViewport ? "animate-loadUp" : ""
        } grid grid-cols-3 md:grid-cols-5 sm:grid-cols-3 gap-10 ease-in transition duration-300`}
      >
        {skillset.map((skill) => (
          <SkillCard
            key={skill.title}
            title={skill.title}
            Icon={skill.icon}
            delay={skill.animationDelay}
          />
        ))}
      </div>

      <ScrollButton pageNo={2} isLight={true} />
    </section>
  );
};

export default Skills;
