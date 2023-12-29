import {motion} from "framer-motion";
import {fadeIn, fadeInX, slideIn} from "../../constants/motion";

const Code = () => {
  return (
    <motion.div
      variants={fadeIn("top", "spring", 0.5, 1.5)}
      initial={"hidden"}
      whileInView={"show"}
      viewport={{once: true}}
      className="p-4 my-2 md:my-0 rounded-md 
                text-tertiary bg-white
                dark:bg-gray-800 dark:text-white 
                  shadow-lg
                  font-extralight
                  text-sm md:text-base"
    >
      <pre>
        1&nbsp;&nbsp;class <b>Person </b>
        {"{"}
      </pre>
      <pre>2&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; constructor() {"{"}</pre>
      <pre>
        3&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; this.name = "<b>Hardik Verma</b>";
      </pre>
      <pre>
        4&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; this.traits = ["<b>DESIGN</b>", "<b>DEV</b>"];
      </pre>
      <pre className="hidden md:block">
        5&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; this.age = new Date().getFullYear() - 1995;
      </pre>
      <pre>6&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {"}"}</pre>
      <pre>7&nbsp;&nbsp; {"}"}</pre>
    </motion.div>
  );
};

export default Code;
