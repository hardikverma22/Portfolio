import {motion} from "framer-motion";

import {slideIn} from "lib/constants/motion";

import logo from "src/assets/logo.svg";
import logoWhite from "src/assets/logo-white.svg";

import DarkModeButton from "src/components/DarkModeButton";
import Menu from "src/components/navigation/Menu";
import MobileMenu from "src/components/navigation/MobileMenu";

const NavigationBar = () => {
  return (
    <header id="navbar" className="w-full fixed top-0 z-[1000] dark:bg-black bg-white">
      <nav
        className="bg-white bg-opacity-70 dark:bg-black dark:bg-opacity-70
                      shadow-lg 
                      flex items-center justify-between 
                      md:px-10 px-5 
                      h-16"
      >
        <motion.div
          variants={slideIn("left", "spring", 0.2, 0.5)}
          initial={"hidden"}
          whileInView={"show"}
          viewport={{once: true}}
          role="link"
          className="cursor-pointer flex gap-2 justify-center items-center hover:text-primary"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({
              top: "4rem",
              behavior: "smooth",
            });
          }}
        >
          <img src={logo} alt="logo" className="h-10 sm:12 dark:hidden" />
          <img src={logoWhite} alt="logo" className="hidden h-10 sm:12 dark:flex" />
        </motion.div>
        <div className="flex gap-6 relative">
          <div
            // variants={slideIn("right", "spring", 0, 0.5)}
            // initial={"hidden"}
            // whileInView={"show"}
            // viewport={{once: true}}
            className="flex gap-6 relative"
          >
            <Menu />
            <DarkModeButton />
          </div>
          <MobileMenu />
        </div>
      </nav>
    </header>
  );
};

export default NavigationBar;
