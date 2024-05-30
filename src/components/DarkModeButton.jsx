import {BsFillSunFill, BsMoonFill} from "src/components/icons";
import {useTheme} from "src/contexts/ThemeContextProvider";
import {THEMES} from "lib/constants";
import {motion} from "framer-motion";

const slideInX = {
  hidden: {opacity: 0, x: 200},
  show: {
    opacity: 1,
    x: 0,
    transition: {duration: 0.9, type: "spring", bounce: 0.3, delay: 0.9},
  },
};

const DarkModeButton = () => {
  const {theme, toggleTheme} = useTheme();
  const IsDark = theme == THEMES.DARK;

  return (
    <motion.label
      variants={slideInX}
      initial={"hidden"}
      animate={"show"}
      htmlFor="customCheckbox"
      className={`flex ${
        IsDark ? "bg-gray-600" : "bg-gray-300"
      } w-20 h-10 relative rounded-full cursor-pointer`}
    >
      <input
        checked={IsDark}
        type="checkbox"
        id="customCheckbox"
        className="peer sr-only"
        onChange={toggleTheme}
      />
      <span className="w-2/5 h-4/5 bg-white absolute rounded-full left-1 top-1 peer-checked:bg-black peer-checked:left-11 duration-300 transition-all flex justify-center items-center">
        {IsDark ? (
          <BsMoonFill className="text-white text-xl" />
        ) : (
          <BsFillSunFill className="text-black text-xl" />
        )}
      </span>
    </motion.label>
  );
};

export default DarkModeButton;
