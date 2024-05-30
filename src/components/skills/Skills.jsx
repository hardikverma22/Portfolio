import {forwardRef} from "react";
import {motion} from "framer-motion";

import ScrollButton from "src/components/common/ScrollButton";
import SkillCard from "src/components/skills/SkillCard";
import SectionTitle from "src/components/common/SectionTitle";
import SectionWrapper from "src/hoc/SectionWrapper";

import {staggerContainer} from "lib/constants/motion";
import {SKILLS} from "lib/constants";

const Skills = forwardRef((_, ref) => {
  return (
    <section
      ref={ref}
      id="skills"
      className="w-full min-h-screen 
                flex flex-col gap-10 justify-center items-center
                md:px-14 px-5 relative
                bg-gradient-to-b from-secondary/10 to-tertiary/10"
    >
      <SectionTitle title="Skills" />
      <motion.div
        variants={staggerContainer(0.5, 0.5)}
        initial={"hidden"}
        whileInView={"show"}
        className="grid grid-cols-3 md:grid-cols-5 sm:grid-cols-3 gap-10 ease-in transition duration-300"
      >
        {SKILLS.map((skill, index) => (
          <SkillCard key={skill.title} title={skill.title} Icon={skill.icon} index={index} />
        ))}
      </motion.div>

      <ScrollButton id="aboutme" />
    </section>
  );
});

export default SectionWrapper(Skills);
