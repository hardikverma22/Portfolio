import { motion } from "framer-motion";
import { Tilt } from "react-tilt";
import { fadeIn } from "../motion";

const SkillCard = ({ title, Icon, index }) => {
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
        whileHover={{ scale: 1.3 }}
        className="group shadow-xl bg-gradient-to-b md:w-28 md:h-28 w-20 h-20 from-[#2BC0E4] to-[#EAECC6] rounded-[20px] shadow-card"
      >
        <div className=" text-black rounded-[20px] flex justify-center items-center flex-col gap-1 p-4">
          <Icon className="md:text-5xl text-3xl text-black group-hover:text-primary" />

          <h3 className="text-primary text-center group-hover:flex text-xs w-full justify-center items-center">
            {title}
          </h3>
        </div>
      </motion.div>
    </Tilt>
  );
};

export default SkillCard;
