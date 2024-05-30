import {motion} from "framer-motion";
import {Tilt} from "react-tilt";
import {fadeIn} from "lib/constants/motion";

const SkillCard = ({title, Icon, index}) => {
  return (
    <Tilt
      className="xs:w-[250px] w-full"
      options={{
        max: 45,
        speed: 50,
      }}
    >
      <motion.div
        variants={fadeIn("right", "spring", index * 0.2, 0.75)}
        whileHover={{scale: 1.3}}
        className="group shadow-xl md:w-28 md:h-28 w-20 h-20 bg-white dark:bg-[#232323] rounded-[20px] shadow-card"
      >
        <div className="h-full text-black rounded-[20px] flex justify-center items-center flex-col gap-1 md:p-4 p-1">
          <Icon className="md:w-10 md:h-10 h-6 w-6 text-black dark:text-white/80  group-hover:text-tertiary dark:group-hover:text-white dark:grayscale" />

          <h3 className="text-tertiary dark:text-white text-center group-hover:flex text-xs w-full justify-center items-center">
            {title}
          </h3>
        </div>
      </motion.div>
    </Tilt>
  );
};

export default SkillCard;
