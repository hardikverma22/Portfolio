import {colors} from "../../constants";
import {motion} from "framer-motion";
import toast from "react-hot-toast";
import {colorCodeContainer, fadeInRotateX} from "../../constants/motion";

const ColorCodes = () => {
  const handleColorClick = (e, c) => {
    e.stopPropagation();
    toast("Copied", {icon: "👍", duration: 1000, position: "bottom-right"});
    navigator.clipboard.writeText(c);
  };

  return (
    <motion.div
      variants={colorCodeContainer()}
      style={{
        "--dark-purple": "4 6 22",
        "--light-purple": "120 119 198",

        "--bg-color": "linear-gradient(rgb(var(--dark-purple)), rgb(var(--dark-purple)))",
        "--border-color": `linear-gradient(145deg,
          rgb(var(--light-purple)) 0%,
          rgb(var(--light-purple) / 0.3) 70.33%,
          rgb(var(--light-purple) / 0.14) 66.67%,
          rgb(var(--light-purple) / 0.1) 100%)
        `,
      }}
      className="flex justify-evenly flex-1
                md:gap-8 gap-6
                md:p-6 p-4  w-full
                dark:[background:padding-box_var(--bg-color),border-box_var(--border-color)]
                border border-transparent group relative rounded-3xl 
                 bg-slate-100 dark:bg-gray-900"
      initial="hidden"
      whileInView="show"
    >
      {colors.map((c) => (
        <motion.div
          whileTap={{scale: 0.8}}
          whileHover={{scale: 1.2}}
          variants={fadeInRotateX()}
          key={c}
          style={{backgroundColor: c}}
          className="md:w-10 md:h-10 w-8 h-8
                      shadow-lg rounded-md
                      dark:border-white/50 border-2"
          onClick={(e) => handleColorClick(e, c)}
        ></motion.div>
      ))}
    </motion.div>
  );
};

export default ColorCodes;
