import {motion} from "framer-motion";
import {textVariant} from "lib/constants/motion";

const SectionTitle = ({title}) => {
  return (
    <motion.div variants={textVariant(0.1)} initial="hidden" whileInView="show">
      <h2 className="text-4xl text-primary dark:text-white font-semibold flex justify-center items-center">
        {title}
      </h2>
    </motion.div>
  );
};

export default SectionTitle;
