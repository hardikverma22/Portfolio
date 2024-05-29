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
        className="group shadow-xl md:w-28 md:h-28 w-20 h-20 bg-white/50 rounded-[20px] shadow-card"
      >
        <div className=" text-black rounded-[20px] flex justify-center items-center flex-col gap-1 p-4">
          <Icon className="md:text-5xl text-3xl text-black grayscale group-hover:text-primary dark:text-white h-10 w-10" />

          <h3 className="text-tertiary dark:text-white text-center group-hover:flex text-xs w-full justify-center items-center">
            {title}
          </h3>
        </div>
      </motion.div>
    </Tilt>
  );
};

export default SkillCard;
