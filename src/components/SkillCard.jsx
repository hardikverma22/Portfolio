import { motion } from "framer-motion";
import { Tilt } from "react-tilt";
import { fadeIn } from "../motion";

const SkillCard = ({ title, Icon, index }) => {
  return (
    <Tilt
      className="xs:w-[250px] w-full"
      options={{
        max: 45,
        // scale: 1.5,
        speed: 50,
      }}
    >
      <motion.div
        variants={fadeIn("right", "spring", index * 0.2, 0.75)}
        whileHover={{ scale: 1.3 }}
        className="group bg-gradient-to-b w-28 h-28 from-[#2BC0E4] to-[#EAECC6] rounded-[20px] shadow-card"
      >
        <div className=" text-black rounded-[20px] flex justify-center items-center flex-col gap-1 p-4">
          <Icon className="text-5xl text-black group-hover:text-primary" />

          <h3 className="text-primary hidden group-hover:flex text-xs w-full justify-center items-center">
            {title}
          </h3>
        </div>
      </motion.div>
    </Tilt>
    // <motion.div whileHover={{ scale: 1.4, transition: { duration: 0.3 } }}>
    //   <motion.div
    //     variants={cardVariants}
    //     title={title}
    //     className={`sm:p-8 w-28 h-28 rounded-xl bg-white shadow-xl group flex flex-col justify-center items-center gap-1`}
    //   >
    //     <Icon className="text-6xl text-tertiary group-hover:text-secondary" />
    //     <span className="text-primary hidden group-hover:flex text-xs w-full  justify-center items-center">
    //       {title}
    //     </span>
    //   </motion.div>
    // </motion.div>
  );
};

export default SkillCard;
