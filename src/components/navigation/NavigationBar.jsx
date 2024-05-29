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
                      px-10 
                      h-16"
      >
        <h1 className="text-2xl md:text-3xl text-tertiary dark:text-white">
          <motion.div
            variants={slideIn("left", "spring", 0.2, 0.5)}
            initial={"hidden"}
            whileInView={"show"}
            viewport={{once: true}}
          >
            <a
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
            </a>
          </motion.div>
        </h1>
        <div className="flex gap-6 relative">
          <motion.div
            // variants={slideIn("right", "spring", 0, 0.5)}
            // initial={"hidden"}
            // whileInView={"show"}
            // viewport={{once: true}}
            className="flex gap-6 relative"
          >
            <Menu />
            <DarkModeButton />
          </motion.div>
          <MobileMenu />
        </div>
      </nav>
    </header>
  );
};

export default NavigationBar;
